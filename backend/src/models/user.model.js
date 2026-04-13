module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      employeeCode: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
      },
      role:{
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Employee'
      },
      
      firstName: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      managerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      baseSalary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'users',
      indexes: [
        { fields: ['email'] },
        { fields: ['employee_code'] },
        { fields: ['manager_id'] },
        { fields: ['is_active'] },
        { fields: ['department'] }
      ]
    }
  );

  return User;
};