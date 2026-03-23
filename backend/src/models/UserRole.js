module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    'UserRole',
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
      roleId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      }
    },
    {
      tableName: 'user_roles',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['role_id'] },
        { fields: ['user_id', 'role_id'], unique: true }
      ]
    }
  );

  return UserRole;
};