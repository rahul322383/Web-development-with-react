
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      
      name: {
        type: DataTypes.ENUM('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
        allowNull: false,
        unique: true
      }
    },
    {
      tableName: 'roles',
      timestamps: true,
      underscored: true
    }
  );

  // FIX: removed Role.associate — handled in initModels.js

  return Role;
};