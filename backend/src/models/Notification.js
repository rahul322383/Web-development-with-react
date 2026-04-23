// module.exports = (sequelize, DataTypes) => {
//   const Notification = sequelize.define(
//     'Notification',
//     {
//       id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         primaryKey: true,
//         autoIncrement: true
//       },
//       userId: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: false
//       },
//       title: {
//         type: DataTypes.STRING(120),
//         allowNull: false
//       },
//       message: {
//         type: DataTypes.STRING(300),
//         allowNull: false
//       },
//       isRead: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: false
//       }
//     },
//     {
//       tableName: 'notifications',
//       indexes: [{ fields: ['user_id', 'is_read'] }]
//     }
//   );

//   return Notification;
// };

'use strict';

/**
 * src/models/Notification.js
 *
 * Extended model — adds type, channel tracking, email/SMS sent flags,
 * and metadata JSON column. Backward-compatible with existing rows.
//  */
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'user_id',
      },
      title: {
        type: DataTypes.STRING(120),
        allowNull: false,
        defaultValue: '',
      },
      message: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },

      // Notification category — drives email template selection & preference checks
      type: {
        type: DataTypes.ENUM(
          'PAYROLL',
          'LEAVE',
          'ATTENDANCE',
          'EXPENSE',
          'APPROVAL',
          'SECURITY',
          'SYSTEM',
          'ANNOUNCEMENT',
        ),
        allowNull: false,
        defaultValue: 'SYSTEM',
      },

      // Which channel delivered this specific record
      channel: {
        type: DataTypes.ENUM('in_app', 'email', 'sms'),
        allowNull: false,
        defaultValue: 'in_app',
      },

      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read',
      },

      // Delivery tracking
      emailSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'email_sent',
      },
      smsSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'sms_sent',
      },

      // Arbitrary payload (payrollId, leaveId, etc.) — stored as JSON string
      metadata: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const raw = this.getDataValue('metadata');
          if (!raw) return {};
          try { return JSON.parse(raw); } catch { return {}; }
        },
        set(val) {
          this.setDataValue(
            'metadata',
            val ? JSON.stringify(val) : null,
          );
        },
      },
    },
    {
      tableName: 'notifications',
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ['user_id', 'is_read'] },
        { fields: ['user_id', 'type'] },
        { fields: ['created_at'] },
      ],
    },
  );

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Notification;
};