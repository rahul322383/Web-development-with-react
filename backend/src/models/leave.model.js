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
        allowNull: false
      },
      managerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
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
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        allowNull: false,
        defaultValue: 'Pending'
      },
      decisionNote: {
        type: DataTypes.STRING(300),
        allowNull: true
      }
    },
    {
      tableName: 'leave_requests',
      underscored: true,
      indexes: [
        { fields: ['employee_id', 'status'] },
        { fields: ['manager_id', 'status'] },
        { fields: ['created_at'] }
      ]
    }
  );

  return LeaveRequest;
};