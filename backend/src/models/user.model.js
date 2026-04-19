// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define(
//     'User',
//     {
//       id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         primaryKey: true,
//         autoIncrement: true
//       },
//       employeeCode: {
//         type: DataTypes.STRING(30),
//         allowNull: false,
//         unique: true
//       },
//       role: {
//         type: DataTypes.STRING(20),
//         allowNull: false,
//         defaultValue: 'Employee'
//       },

//       firstName: {
//         type: DataTypes.STRING(80),
//         allowNull: false
//       },
//       lastName: {
//         type: DataTypes.STRING(80),
//         allowNull: false
//       },
//       email: {
//         type: DataTypes.STRING(120),
//         allowNull: false,
//         unique: true
//       },
//       passwordHash: {
//         type: DataTypes.STRING(255),
//         allowNull: false
//       },
//       managerId: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//         references: {
//           model: 'users',
//           key: 'id'
//         }
//       },
//       department: {
//         type: DataTypes.STRING(100),
//         allowNull: true
//       },
//       baseSalary: {
//         type: DataTypes.DECIMAL(12, 2),
//         allowNull: false,
//         defaultValue: 0
//       },
//       isActive: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: true
//       }
//     },
//     {
//       tableName: 'users',
//       indexes: [
//         { fields: ['email'] },
//         { fields: ['employee_code'] },
//         { fields: ['manager_id'] },
//         { fields: ['is_active'] },
//         { fields: ['department'] }
//       ]
//     }
//   );

//   return User;
// };



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

      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Employee'
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
        type: DataTypes.BIGINT.UNSIGNED, // ✅ FIXED
        allowNull: true,
        field: 'manager_id',
        references: {
          model: 'users',
          key: 'id'
        }
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

      // ⚠️ IMPORTANT: avoid duplicate index creation
      indexes: [
        // { unique: true, fields: ['employee_code'] },
        // { unique: true, fields: ['email'] },
        // { fields: ['manager_id'] },
        // { fields: ['is_active'] }
      ]
    }
  );

  return User;
};


// // // // module.exports = (sequelize, DataTypes) => {
// // // //   const User = sequelize.define(
// // // //     'User',
// // // //     {
// // // //       id: {
// // // //         type: DataTypes.BIGINT.UNSIGNED,
// // // //         primaryKey: true,
// // // //         autoIncrement: true
// // // //       },
// // // //       employeeCode: {
// // // //         type: DataTypes.STRING(30),
// // // //         allowNull: false,
// // // //         unique: true
// // // //       },
// // // //       role:{
// // // //         type: DataTypes.STRING(20),
// // // //         allowNull: false,
// // // //         defaultValue: 'Employee'
// // // //       },

// // // //       firstName: {
// // // //         type: DataTypes.STRING(80),
// // // //         allowNull: false
// // // //       },
// // // //       lastName: {
// // // //         type: DataTypes.STRING(80),
// // // //         allowNull: false
// // // //       },
// // // //       email: {
// // // //         type: DataTypes.STRING(120),
// // // //         allowNull: false,
// // // //         unique: true
// // // //       },
// // // //       passwordHash: {
// // // //         type: DataTypes.STRING(255),
// // // //         allowNull: false
// // // //       },
// // // //       managerId: {
// // // //         type: DataTypes.INTEGER,
// // // //         allowNull: true,
// // // //         references: {
// // // //           model: 'users',
// // // //           key: 'id'
// // // //         }
// // // //       },
// // // //       department: {
// // // //         type: DataTypes.STRING(100),
// // // //         allowNull: true
// // // //       },
// // // //       baseSalary: {
// // // //         type: DataTypes.DECIMAL(12, 2),
// // // //         allowNull: false,
// // // //         defaultValue: 0
// // // //       },
// // // //       isActive: {
// // // //         type: DataTypes.BOOLEAN,
// // // //         allowNull: false,
// // // //         defaultValue: true
// // // //       }
// // // //     },
// // // //     {
// // // //       tableName: 'users',
// // // //       indexes: [
// // // //         { fields: ['email'] },
// // // //         { fields: ['employee_code'] },
// // // //         { fields: ['manager_id'] },
// // // //         { fields: ['is_active'] },
// // // //         { fields: ['department'] }
// // // //       ]
// // // //     }
// // // //   );

// // // //   return User;
// // // // };


// // module.exports = (sequelize, DataTypes) => {
// //   const User = sequelize.define(
// //     'User',
// //     {
// //       id: {
// //         type: DataTypes.BIGINT.UNSIGNED,
// //         primaryKey: true,
// //         autoIncrement: true
// //       },

// //       employeeCode: {
// //         type: DataTypes.STRING(30),
// //         allowNull: false,
// //         unique: true
// //       },

// //       role: {
// //         type: DataTypes.STRING(20),
// //         allowNull: false,
// //         defaultValue: 'Employee'
// //       },

// //       firstName: {
// //         type: DataTypes.STRING(80),
// //         allowNull: false
// //       },

// //       lastName: {
// //         type: DataTypes.STRING(80),
// //         allowNull: false
// //       },

// //       email: {
// //         type: DataTypes.STRING(120),
// //         allowNull: false,
// //         unique: true,
// //         validate: {
// //           isEmail: true
// //         }
// //       },

// //       passwordHash: {
// //         type: DataTypes.STRING(255),
// //         allowNull: false
// //       },

// //       managerId: {
// //         type: DataTypes.BIGINT.UNSIGNED,
// //         allowNull: true,
// //         references: {
// //           model: 'users',
// //           key: 'id'
// //         },
// //         onUpdate: 'CASCADE',
// //         onDelete: 'SET NULL'
// //       },

// //       department: {
// //         type: DataTypes.STRING(100),
// //         allowNull: true
// //       },

// //       baseSalary: {
// //         type: DataTypes.DECIMAL(12, 2),
// //         allowNull: false,
// //         defaultValue: 0,
// //         validate: {
// //           min: 0
// //         }
// //       },

// //       isActive: {
// //         type: DataTypes.BOOLEAN,
// //         allowNull: false,
// //         defaultValue: true
// //       }
// //     },
// //     {
// //       tableName: 'users',
// //       timestamps: true,

// //       indexes: [
// //         {
// //           unique: true,
// //           fields: ['email']
// //         },
// //         {
// //           unique: true,
// //           fields: ['employeeCode']
// //         },
// //         {
// //           fields: ['managerId']
// //         },
// //         {
// //           fields: ['isActive']
// //         },
// //         {
// //           fields: ['department']
// //         }
// //       ]
// //     }
// //   );

// //   // 🔥 SELF ASSOCIATION (IMPORTANT)
// //   User.associate = (models) => {
// //     User.belongsTo(models.User, {
// //       foreignKey: 'managerId',
// //       as: 'manager'
// //     });

// //     User.hasMany(models.User, {
// //       foreignKey: 'managerId',
// //       as: 'subordinates'
// //     });
// //   };

// //   return User;
// // };
// module.exports = (sequelize, DataTypes) => {
//   const User = sequelize.define(
//     'User',
//     {
//       id: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         primaryKey: true,
//         autoIncrement: true
//       },

//       employeeCode: {
//         type: DataTypes.STRING(30),
//         allowNull: false,
//         unique: true
//       },

//       firstName: {
//         type: DataTypes.STRING(80),
//         allowNull: false
//       },

//       lastName: {
//         type: DataTypes.STRING(80),
//         allowNull: false
//       },

//       email: {
//         type: DataTypes.STRING(120),
//         allowNull: false,
//         unique: true,
//         validate: {
//           isEmail: true
//         }
//       },

//       passwordHash: {
//         type: DataTypes.STRING(255),
//         allowNull: false
//       },

//       managerId: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: true
//       },

//       roleId: {
//         type: DataTypes.BIGINT.UNSIGNED,
//         allowNull: false
//       },

//       department: {
//         type: DataTypes.STRING(100),
//         allowNull: true
//       },

//       baseSalary: {
//         type: DataTypes.DECIMAL(12, 2),
//         allowNull: false,
//         defaultValue: 0,
//         validate: {
//           min: 0
//         }
//       },

//       isActive: {
//         type: DataTypes.BOOLEAN,
//         allowNull: false,
//         defaultValue: true
//       }
//     },
//     {
//       tableName: 'users',

//       // 🔥 THIS FIXES ALL YOUR PROBLEMS
//       underscored: true, // converts camelCase → snake_case in DB

//       timestamps: true,

//       indexes: [
//         { unique: true, fields: ['email'] },
//         { unique: true, fields: ['employeeCode'] }, // ✅ now safe

//         { fields: ['managerId'] },
//         { fields: ['roleId'] },
//         { fields: ['isActive'] },
//         { fields: ['department'] }
//       ]
//     }
//   );

//   // ✅ ASSOCIATIONS
//   User.associate = (models) => {
//     // Self relation
//     User.belongsTo(models.User, {
//       foreignKey: {
//         name: 'managerId',
//         allowNull: true
//       },
//       as: 'manager',
//       onDelete: 'SET NULL',
//       onUpdate: 'CASCADE'
//     });

//     User.hasMany(models.User, {
//       foreignKey: 'managerId',
//       as: 'subordinates'
//     });

//     // Role relation
//     User.belongsTo(models.Role, {
//       foreignKey: {
//         name: 'roleId',
//         allowNull: false
//       },
//       as: 'role',
//       onDelete: 'RESTRICT',
//       onUpdate: 'CASCADE'
//     });
//   };

//   return User;
// };