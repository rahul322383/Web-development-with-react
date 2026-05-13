

'use strict';

const { Op, fn, col, literal } = require('sequelize');

const {
  Attendance,
  User,
} = require('../../database/initModels');

const eventBus = require('../../utils/Eventbus');
const logger = require('../../config/logger');

// ─────────────────────────────────────────────────────────────
// DEFAULT SHIFT CONFIG
// ─────────────────────────────────────────────────────────────

const DEFAULT_SHIFT = {
  startTime: '09:00',
  endTime: '18:00',
  graceMins: 15,
  fullDayMins: 8 * 60,
  halfDayMins: 4 * 60,
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const makeError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const todayISO = () => {
  return new Date().toISOString().slice(0, 10);
};

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
};

const toMinutes = (time) => {
  if (!time) return 0;

  const [h, m] = time.split(':').map(Number);

  return (h * 60) + m;
};

const normalizeDate = (date) => {
  return new Date(date).toISOString().slice(0, 10);
};

const getClientIp = (reqIp) => {
  if (!reqIp) return null;

  if (reqIp.includes(',')) {
    return reqIp.split(',')[0].trim();
  }

  return reqIp;
};

// ─────────────────────────────────────────────────────────────
// SHIFT RESOLVER
// ─────────────────────────────────────────────────────────────

const resolveShift = async (employeeId) => {
  try {
    const user = await User.findByPk(employeeId, {
      include: [
        {
          association: 'shift',
          required: false,
        },
      ],
    });

    const shift = user?.shift;

    if (!shift) {
      return DEFAULT_SHIFT;
    }

    return {
      startTime: shift.startTime || DEFAULT_SHIFT.startTime,
      endTime: shift.endTime || DEFAULT_SHIFT.endTime,
      graceMins: shift.graceMins ?? DEFAULT_SHIFT.graceMins,
      fullDayMins: shift.fullDayMins || DEFAULT_SHIFT.fullDayMins,
      halfDayMins: shift.halfDayMins || DEFAULT_SHIFT.halfDayMins,
    };
  } catch (err) {
    logger.error({
      event: 'SHIFT_RESOLVE_ERROR',
      employeeId,
      error: err.message,
    });

    return DEFAULT_SHIFT;
  }
};

// ─────────────────────────────────────────────────────────────
// ATTENDANCE METRICS
// ─────────────────────────────────────────────────────────────

const calcMetricsWithShift = ({
  checkIn,
  checkOut,
  shift,
}) => {

  if (!checkIn || !checkOut) {
    return {
      workedMinutes: 0,
      overtimeMinutes: 0,
      lateMinutes: 0,
      isLate: false,
      hasOvertime: false,
      status: 'absent',
    };
  }

  const cin = toMinutes(checkIn);
  const cout = toMinutes(checkOut);

  let workedMinutes;

  // overnight support
  if (cout < cin) {
    workedMinutes = (1440 - cin) + cout;
  } else {
    workedMinutes = cout - cin;
  }

  workedMinutes = Math.max(0, workedMinutes);

  const shiftStart = toMinutes(shift.startTime);

  const graceEnd = shiftStart + shift.graceMins;

  const isLate = cin > graceEnd;

  // FIXED LATE CALCULATION
  const lateMinutes = isLate
    ? cin - graceEnd
    : 0;

  const overtimeMinutes = Math.max(
    0,
    workedMinutes - shift.fullDayMins
  );

  const hasOvertime = overtimeMinutes > 0;

  let status = 'absent';

  if (workedMinutes >= shift.fullDayMins) {
    status = isLate ? 'late' : 'present';
  } else if (workedMinutes >= shift.halfDayMins) {
    status = 'half_day';
  }

  return {
    workedMinutes,
    overtimeMinutes,
    lateMinutes,
    isLate,
    hasOvertime,
    status,
  };
};

// ─────────────────────────────────────────────────────────────
// NOTIFICATION HELPERS
// ─────────────────────────────────────────────────────────────

const getNotifyTargets = async (employeeId) => {
  try {

    const employee = await User.findByPk(employeeId, {
      attributes: [
        'id',
        'firstName',
        'lastName',
        'managerId',
      ],
      include: [
        {
          association: 'role',
          attributes: ['name'],
          required: false,
        },
      ],
    });

    if (!employee) {
      return {
        employee: null,
        managerIds: [],
        hrAdminIds: [],
      };
    }

    const hrAdmins = await User.findAll({
      where: {
        isActive: true,
      },

      include: [
        {
          association: 'role',
          required: true,
          where: {
            name: ['Admin', 'HR'],
          },
        },
      ],

      attributes: ['id'],
    });

    const hrAdminIds = hrAdmins
      .map(u => u.id)
      .filter(id => id !== employeeId);

    const managerIds = employee.managerId
      ? [employee.managerId]
      : [];

    return {
      employee,
      managerIds,
      hrAdminIds,
    };

  } catch (err) {

    logger.error({
      event: 'NOTIFY_TARGET_ERROR',
      employeeId,
      error: err.message,
    });

    return {
      employee: null,
      managerIds: [],
      hrAdminIds: [],
    };
  }
};

// ─────────────────────────────────────────────────────────────
// CHECK IN
// ─────────────────────────────────────────────────────────────

const checkIn = async ({
  employeeId,
  checkInTime,
  ip,
}) => {

  if (!employeeId) {
    throw makeError('employeeId is required.', 400);
  }

  if (!checkInTime) {
    throw makeError('checkInTime is required.', 400);
  }

  const user = await User.findByPk(employeeId);

  if (!user) {
    throw makeError('Employee not found.', 404);
  }

  if (!user.companyId) {
    throw makeError(
      'Employee company assignment missing.',
      400
    );
  }

  const companyId = user.companyId;

  const date = todayISO();

  // PREVENT DUPLICATES
  const existing = await Attendance.findOne({
    where: {
      employeeId,
      date,
    },
  });

  if (existing?.checkIn) {
    throw makeError(
      'Already checked in today.',
      409
    );
  }

  const shift = await resolveShift(employeeId);

  const cin = toMinutes(checkInTime);

  const shiftStart = toMinutes(shift.startTime);

  const graceEnd = shiftStart + shift.graceMins;

  const isLate = cin > graceEnd;

  // FIXED LATE CALCULATION
  const lateMinutes = isLate
    ? cin - graceEnd
    : 0;

  const payload = {
    employeeId,
    companyId,
    date,

    checkIn: checkInTime,

    checkInIp: getClientIp(ip),

    isLate,
    lateMinutes,

    status: isLate
      ? 'late'
      : 'present',
  };

  let attendance;

  if (existing) {

    await existing.update(payload);

    attendance = await existing.reload();

  } else {

    attendance = await Attendance.create(payload);
  }

  // notifications
  if (isLate) {

    eventBus.emit(
      'ATTENDANCE_LATE',
      {
        employeeId,
        lateMinutes,
        date,
      }
    );
  }

  return attendance;
};

// ─────────────────────────────────────────────────────────────
// CHECK OUT
// ─────────────────────────────────────────────────────────────

const checkOut = async ({
  employeeId,
  checkOutTime,
  ip,
}) => {

  if (!employeeId) {
    throw makeError('employeeId is required.', 400);
  }

  if (!checkOutTime) {
    throw makeError('checkOutTime is required.', 400);
  }

  const date = todayISO();

  const attendance = await Attendance.findOne({
    where: {
      employeeId,
      date,
    },
  });

  if (!attendance) {
    throw makeError(
      'Attendance not found.',
      404
    );
  }

  if (!attendance.checkIn) {
    throw makeError(
      'Check-in missing.',
      400
    );
  }

  if (attendance.checkOut) {
    throw makeError(
      'Already checked out.',
      409
    );
  }

  const shift = await resolveShift(employeeId);

  const metrics = calcMetricsWithShift({
    checkIn: attendance.checkIn,
    checkOut: checkOutTime,
    shift,
  });

  await attendance.update({

    checkOut: checkOutTime,

    checkOutIp: getClientIp(ip),

    workedMinutes: metrics.workedMinutes,

    overtimeMinutes: metrics.overtimeMinutes,

    lateMinutes: metrics.lateMinutes,

    isLate: metrics.isLate,

    hasOvertime: metrics.hasOvertime,

    status: metrics.status,
  });

  return attendance.reload();
};

// ─────────────────────────────────────────────────────────────
// ADMIN MANUAL RECORD
// ─────────────────────────────────────────────────────────────

const adminRecord = async ({
  employeeId,
  date,
  checkIn,
  checkOut,
  notes,
  approvedBy,
}) => {

  const user = await User.findByPk(employeeId);

  if (!user) {
    throw makeError(
      'Employee not found.',
      404
    );
  }

  const shift = await resolveShift(employeeId);

  const metrics = (
    checkIn && checkOut
  )
    ? calcMetricsWithShift({
      checkIn,
      checkOut,
      shift,
    })
    : {
      status: 'absent',
    };

  const payload = {

    employeeId,

    companyId: user.companyId,

    date: normalizeDate(date),

    checkIn: checkIn || null,

    checkOut: checkOut || null,

    notes: notes || null,

    approvedBy: approvedBy || null,

    workedMinutes:
      metrics.workedMinutes || 0,

    overtimeMinutes:
      metrics.overtimeMinutes || 0,

    lateMinutes:
      metrics.lateMinutes || 0,

    isLate:
      metrics.isLate || false,

    hasOvertime:
      metrics.hasOvertime || false,

    status:
      metrics.status || 'absent',
  };

  const existing = await Attendance.findOne({
    where: {
      employeeId,
      date: payload.date,
    },
  });

  let record;

  if (existing) {

    await existing.update(payload);

    record = await existing.reload();

  } else {

    record = await Attendance.create(payload);
  }

  return record;
};

// ─────────────────────────────────────────────────────────────
// TODAY SUMMARY
// ─────────────────────────────────────────────────────────────

const getTodaySummary = async () => {

  const date = todayISO();

  const records = await Attendance.findAll({

    where: { date },

    include: [
      {
        model: User,
        as: 'employee',

        attributes: [
          'id',
          'first_name',
          'last_name',
          'email',
        ],
      },
    ],
  });

  const summary = {
    present: 0,
    late: 0,
    absent: 0,
    half_day: 0,
  };

  records.forEach((r) => {

    if (summary[r.status] !== undefined) {
      summary[r.status]++;
    }
  });

  return {
    date,
    summary,
    records,
  };
};

// ─────────────────────────────────────────────────────────────
// MY ATTENDANCE
// ─────────────────────────────────────────────────────────────



const getMyAttendance = async ({
  employeeId,
  startDate,
  endDate,
  page = 1,
  limit = 20,
}) => {

  // =========================
  // VALIDATION
  // =========================

  if (!employeeId) {
    throw makeError(
      'employeeId is required.',
      400
    );
  }

  page = Math.max(
    safeNumber(page, 1),
    1
  );

  limit = Math.min(
    Math.max(safeNumber(limit, 20), 1),
    100
  );

  const offset = (page - 1) * limit;

  // =========================
  // WHERE CONDITION
  // =========================

  const where = {
    employee_id: employeeId,
  };

  if (startDate || endDate) {

    where.date = {};

    if (startDate) {
      where.date[Op.gte] =
        normalizeDate(startDate);
    }

    if (endDate) {
      where.date[Op.lte] =
        normalizeDate(endDate);
    }
  }

  // =========================
  // FETCH RECORDS
  // =========================

  const { count, rows } =
    await Attendance.findAndCountAll({

      where,

      limit,
      offset,

      order: [['date', 'DESC']],
    });

  // =========================
  // FETCH STATS
  // =========================

  const stats =
    await Attendance.findOne({

      where,

      attributes: [

        [
          fn(
            'SUM',
            literal(`
              CASE
                WHEN status = 'present'
                THEN 1
                ELSE 0
              END
            `)
          ),
          'present',
        ],

        [
          fn(
            'SUM',
            literal(`
              CASE
                WHEN status = 'late'
                THEN 1
                ELSE 0
              END
            `)
          ),
          'late',
        ],

        [
          fn(
            'SUM',
            literal(`
              CASE
                WHEN status = 'half_day'
                THEN 1
                ELSE 0
              END
            `)
          ),
          'halfDay',
        ],

        [
          fn(
            'SUM',
            literal(`
              CASE
                WHEN status = 'absent'
                THEN 1
                ELSE 0
              END
            `)
          ),
          'absent',
        ],

        [
          fn(
            'SUM',
            col('worked_minutes')
          ),
          'workedMinutes',
        ],

        [
          fn(
            'SUM',
            col('overtime_minutes')
          ),
          'overtimeMinutes',
        ],

        [
          fn(
            'SUM',
            col('late_minutes')
          ),
          'lateMinutes',
        ],
      ],

      raw: true,
    });

  // =========================
  // RESPONSE
  // =========================

  return {

    meta: {

      totalRecords: count,

      currentPage: page,

      limit,

      totalPages:
        Math.ceil(count / limit),
    },

    stats: {

      present:
        Number(stats?.present || 0),

      late:
        Number(stats?.late || 0),

      halfDay:
        Number(stats?.halfDay || 0),

      absent:
        Number(stats?.absent || 0),

      workedMinutes:
        Number(stats?.workedMinutes || 0),

      overtimeMinutes:
        Number(stats?.overtimeMinutes || 0),

      lateMinutes:
        Number(stats?.lateMinutes || 0),
    },

    records: rows,
  };
};

// ─────────────────────────────────────────────────────────────
// TEAM REPORT
// ─────────────────────────────────────────────────────────────

const getTeamReport = async ({
  startDate,
  endDate,
  employeeId,
  status,
  page = 1,
  limit = 50,
}) => {

  page = Math.max(
    safeNumber(page, 1),
    1
  );

  limit = Math.min(
    Math.max(safeNumber(limit, 50), 1),
    100
  );

  const offset = (page - 1) * limit;

  const where = {};

  if (employeeId) {
    where.employeeId =
      Number(employeeId);
  }

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {

    where.date = {};

    if (startDate) {
      where.date[Op.gte] =
        normalizeDate(startDate);
    }

    if (endDate) {
      where.date[Op.lte] =
        normalizeDate(endDate);
    }
  }

  const { count, rows } =
    await Attendance.findAndCountAll({

      where,

      limit,
      offset,

      order: [['date', 'DESC']],

      include: [
        {
          model: User,
          as: 'employee',

          attributes: [
            'id',
            'first_name',
            'last_name',
            'email',
          ],
        },
      ],
    });

  return {
    meta: {
      count,
      page,
      limit,
      totalPages:
        Math.ceil(count / limit),
    },
    records: rows,
  };
};

// ─────────────────────────────────────────────────────────────
// OVERTIME SUMMARY
// ─────────────────────────────────────────────────────────────

const getOvertimeSummary = async ({
  employeeId,
  month,
  year,
}) => {

  const mm =
    String(month).padStart(2, '0');

  const startDate =
    `${year}-${mm}-01`;

  const endDate = new Date(
    year,
    Number(month),
    0
  )
    .toISOString()
    .slice(0, 10);

  const records =
    await Attendance.findAll({

      where: {

        employeeId,

        hasOvertime: true,

        date: {
          [Op.between]: [
            startDate,
            endDate,
          ],
        },
      },
    });

  const totalMinutes =
    records.reduce(
      (sum, r) =>
        sum + (r.overtimeMinutes || 0),
      0
    );

  return {

    employeeId,

    month,

    year,

    overtimeDays:
      records.length,

    totalOvertimeMinutes:
      totalMinutes,

    totalOvertimeHours:
      +(totalMinutes / 60).toFixed(2),

    records,
  };
};

// ─────────────────────────────────────────────────────────────
// GET BY ID
// ─────────────────────────────────────────────────────────────

const getById = async (id) => {

  const record =
    await Attendance.findByPk(id, {

      include: [

        {
          model: User,
          as: 'employee',

          attributes: [
            'id',
            'first_name',
            'last_name',
            'email',
          ],
        },

        {
          model: User,
          as: 'approver',

          attributes: [
            'id',
            'first_name',
            'last_name',
          ],
        },
      ],
    });

  if (!record) {
    throw makeError(
      'Attendance not found.',
      404
    );
  }

  return record;
};

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

module.exports = {

  checkIn,

  checkOut,

  adminRecord,

  getTodaySummary,

  getMyAttendance,

  getTeamReport,

  getOvertimeSummary,

  getById,

  calcMetricsWithShift,
};