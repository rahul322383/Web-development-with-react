module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      moduleName: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      actionType: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'APPROVE'),
        allowNull: false
      },
      oldData: {
        type: DataTypes.JSON,
        allowNull: true
      },
      newData: {
        type: DataTypes.JSON,
        allowNull: true
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true
      }
    },
    {
      tableName: 'audit_logs',
      paranoid: false,
      updatedAt: false,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['module_name', 'action_type'] },
        { fields: ['timestamp'] }
      ]
    }
  );

  AuditLog.beforeUpdate(() => {
    throw new Error('Audit logs are immutable');
  });

  return AuditLog;
};