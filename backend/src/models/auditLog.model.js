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
        allowNull: false,
        field: 'user_id'
      },

      moduleName: {
        type: DataTypes.STRING(80),
        allowNull: false,
        field: 'module_name'
      },

      actionType: {
        type: DataTypes.ENUM(
          'CREATE',
          'UPDATE',
          'DELETE',
          'APPROVE',
          'CHAT',
          'VIEW',
          'PROFILE_VIEW',
          'LEAVE_APPLY',
          'LEAVE_CANCEL',
          'POLICY_SEARCH',
          'AI_REQUEST'
        ),
        allowNull: false,
        field: 'action_type'
      },

      oldData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'old_data'
      },

      newData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'new_data'
      },

      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'timestamp'
      },

      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: 'ip_address'
      },

      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
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