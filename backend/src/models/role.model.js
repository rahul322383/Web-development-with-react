// module.exports = (sequelize, DataTypes) => {
//   const Role = sequelize.define(
//     'Role',
//     {
//       id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         primaryKey: true,
//         autoIncrement: true
//       },
//       name: {
//         type: DataTypes.ENUM('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//         allowNull: false,
//         unique: true
//       }
//     },
//     {
//       tableName: 'roles',
//       indexes: [{ fields: ['name'], unique: true }]
//     }
//   );

//   return Role;
// };


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
        type: DataTypes.ENUM(
          'Employee',
          'Manager',
          'HR',
          'Finance',
          'Admin'
        ),
        allowNull: false,
        unique: true
      }
    },
    {
      tableName: 'roles',
      timestamps: true
    }
  );

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'roleId',
      as: 'users'
    });
  };

  return Role;
};