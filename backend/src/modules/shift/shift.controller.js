'use strict';

const shiftService = require('./shiftService');

// Standard response handler
const handleResponse = (res, result) => {
    if (!result.success) {
        return res.status(result.statusCode || 400).json({
            success: false,
            message: result.message,
        });
    }

    return res.status(result.statusCode || 200).json({
        success: true,
        data: result.data,
        message: result.message,
    });
};

// ─────────────────────────────────────────

// CREATE SHIFT
exports.createShift = async (req, res) => {
    const result = await shiftService.createShift({
        actor: req.user,
        data: req.body,
    });

    return handleResponse(res, result);
};

// UPDATE SHIFT
exports.updateShift = async (req, res) => {
    const result = await shiftService.updateShift({
        actor: req.user,
        shiftId: req.params.id,
        data: req.body,
    });

    return handleResponse(res, result);
};

// DELETE SHIFT
exports.deleteShift = async (req, res) => {
    const result = await shiftService.deleteShift({
        actor: req.user,
        shiftId: req.params.id,
    });

    return handleResponse(res, result);
};

// LIST SHIFTS
exports.listShifts = async (req, res) => {
    const result = await shiftService.listShifts({
        actor: req.user,
        company_id: req.user.companyId,

    });
    return handleResponse(res, result);
};

// ASSIGN SHIFT
exports.assignShift = async (req, res) => {
    const result = await shiftService.assignShift({
        actor: req.user,
        data: req.body,
    });

    return handleResponse(res, result);
};

// SHIFT HISTORY
exports.getEmployeeShiftHistory = async (req, res) => {
    const result = await shiftService.getEmployeeShiftHistory({
        actor: req.user,
        employeeId: req.params.employeeId,
    });

    return handleResponse(res, result);
};

// SHIFT REPORT
exports.getShiftReport = async (req, res) => {
    const result = await shiftService.getShiftReport({
        actor: req.user,
        month: req.query.month,
        year: req.query.year,
    });

    return handleResponse(res, result);
};