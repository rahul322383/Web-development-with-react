

module.exports = (sequelize, DataTypes) => {
  const LeaveRequest = sequelize.define(
    'LeaveRequest',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },

      employeeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'employee_id' // ✅ FIX
      },

      managerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'manager_id' 
      },

      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'start_date'
      },

      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'end_date'
      },

      reason: {
        type: DataTypes.STRING(300),
        allowNull: true
      },

      daysRequested: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'days_requested' // ✅ FIX
      },

      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'company_id'
      },
      

      decisionNote: {
        type: DataTypes.STRING(300),
        allowNull: true,
        field: 'decision_note' // ✅ FIX
      }
    },
    {
      tableName: 'leave_requests',
      underscored: true,
      timestamps: true // ✅ ensures created_at, updated_at mapping
    }
  );

  return LeaveRequest;
};