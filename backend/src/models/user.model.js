

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
        unique: true,
        field: 'employee_code'
      },
      roleId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'role_id',
        references: { model: 'roles', key: 'id' }
      },
      companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        field: 'company_id', 
      },
      firstName: {
        type: DataTypes.STRING(80),
        allowNull: false,
        field: 'first_name'
      },
      lastName: {
        type: DataTypes.STRING(80),
        allowNull: false,
        field: 'last_name'
      },
      email: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
        field: 'email'
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
      },
      managerId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'manager_id',
        references: { model: 'users', key: 'id' }
      },

      department: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'department'
      },
      baseSalary: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'base_salary'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      }
    },
    {
      tableName: 'users',
      timestamps: true,
      underscored: true,
      indexes: []
    }
  );

  return User;
};