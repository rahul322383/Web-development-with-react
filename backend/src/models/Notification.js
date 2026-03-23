module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
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
      title: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      message: {
        type: DataTypes.STRING(300),
        allowNull: false
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: 'notifications',
      indexes: [{ fields: ['user_id', 'is_read'] }]
    }
  );

  return Notification;
};