// 'use strict';

// module.exports = (sequelize, DataTypes) => {
//     const Job = sequelize.define(
//         'Job',
//         {
//             id: {
//                 type: DataTypes.BIGINT.UNSIGNED,
//                 primaryKey: true,
//                 autoIncrement: true,
//             },
//             companyId: {
//                 type: DataTypes.BIGINT.UNSIGNED,
//                 allowNull: false,
//                 field: 'company_id',
//                 references: { model: 'companies', key: 'id' },
//             },
//             postedBy: {
//                 type: DataTypes.BIGINT.UNSIGNED,
//                 allowNull: false,
//                 field: 'posted_by',
//                 references: { model: 'users', key: 'id' },
//             },
//             title: {
//                 type: DataTypes.STRING(200),
//                 allowNull: false,
//                 field: 'title',
//             },
//             slug: {
//                 type: DataTypes.STRING(220),
//                 allowNull: false,
//                 unique: true,
//                 field: 'slug',
//             },
//             department: {
//                 type: DataTypes.STRING(100),
//                 allowNull: true,
//                 field: 'department',
//             },
//             location: {
//                 type: DataTypes.STRING(150),
//                 allowNull: true,
//                 field: 'location',
//             },
//             employmentType: {
//                 type: DataTypes.ENUM('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'),
//                 allowNull: false,
//                 defaultValue: 'Full-Time',
//                 field: 'employment_type',
//             },
//             experienceLevel: {
//                 type: DataTypes.ENUM('Entry', 'Mid', 'Senior', 'Lead', 'Manager', 'Executive'),
//                 allowNull: false,
//                 defaultValue: 'Mid',
//                 field: 'experience_level',
//             },
//             salaryMin: {
//                 type: DataTypes.DECIMAL(12, 2),
//                 allowNull: true,
//                 field: 'salary_min',
//             },
//             salaryMax: {
//                 type: DataTypes.DECIMAL(12, 2),
//                 allowNull: true,
//                 field: 'salary_max',
//             },
//             currency: {
//                 type: DataTypes.STRING(10),
//                 allowNull: false,
//                 defaultValue: 'INR',
//                 field: 'currency',
//             },
//             description: {
//                 type: DataTypes.TEXT,
//                 allowNull: true,
//                 field: 'description',
//             },
//             responsibilities: {
//                 type: DataTypes.TEXT,
//                 allowNull: true,
//                 field: 'responsibilities',
//             },
//             requirements: {
//                 type: DataTypes.TEXT,
//                 allowNull: true,
//                 field: 'requirements',
//             },
//             skills: {
//                 type: DataTypes.JSON,
//                 allowNull: true,
//                 defaultValue: [],
//                 field: 'skills',
//             },
//             openings: {
//                 type: DataTypes.INTEGER.UNSIGNED,
//                 allowNull: false,
//                 defaultValue: 1,
//                 field: 'openings',
//             },
//             status: {
//                 type: DataTypes.ENUM('Draft', 'Published', 'Paused', 'Closed', 'Expired'),
//                 allowNull: false,
//                 defaultValue: 'Draft',
//                 field: 'status',
//             },
//             isRemote: {
//                 type: DataTypes.BOOLEAN,
//                 allowNull: false,
//                 defaultValue: false,
//                 field: 'is_remote',
//             },
//             expiresAt: {
//                 type: DataTypes.DATE,
//                 allowNull: true,
//                 field: 'expires_at',
//             },
//         },
//         {
//             tableName: 'jobs',
//             timestamps: true,
//             underscored: true,
//             paranoid: true,          // soft delete — matches your global define
//             indexes: [
//                 { fields: ['company_id'] },
//                 { fields: ['status'] },
//                 { fields: ['slug'], unique: true },
//                 { fields: ['department'] },
//             ],
//         },
//     );

//     return Job;
// };
'use strict';

module.exports = (sequelize, DataTypes) => {

    const Job = sequelize.define(
        'Job',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },

            companyId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                field: 'company_id',

                references: {
                    model: 'companies',
                    key: 'id',
                },
            },

            postedBy: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                field: 'posted_by',

                references: {
                    model: 'users',
                    key: 'id',
                },
            },

            title: {
                type: DataTypes.STRING(200),
                allowNull: false,
                field: 'title',
            },

            slug: {
                type: DataTypes.STRING(220),
                allowNull: false,
                unique: true,
                field: 'slug',
            },

            department: {
                type: DataTypes.STRING(100),
                allowNull: true,
                field: 'department',
            },

            location: {
                type: DataTypes.STRING(150),
                allowNull: true,
                field: 'location',
            },

            employmentType: {
                type: DataTypes.ENUM(
                    'Full-Time',
                    'Part-Time',
                    'Contract',
                    'Internship',
                    'Freelance'
                ),

                allowNull: false,
                defaultValue: 'Full-Time',
                field: 'employment_type',
            },

            experienceLevel: {
                type: DataTypes.ENUM(
                    'Entry',
                    'Mid',
                    'Senior',
                    'Lead',
                    'Manager',
                    'Executive'
                ),

                allowNull: false,
                defaultValue: 'Mid',
                field: 'experience_level',
            },

            salaryMin: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: true,
                field: 'salary_min',
            },

            salaryMax: {
                type: DataTypes.DECIMAL(12, 2),
                allowNull: true,
                field: 'salary_max',
            },

            currency: {
                type: DataTypes.STRING(10),
                allowNull: false,
                defaultValue: 'INR',
                field: 'currency',
            },

            description: {
                type: DataTypes.TEXT('long'),
                allowNull: true,
                field: 'description',
            },

            // ✅ JSON instead of TEXT
            responsibilities: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                field: 'responsibilities',
            },

            // ✅ JSON instead of TEXT
            requirements: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                field: 'requirements',
            },

            skills: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: [],
                field: 'skills',
            },

            openings: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 1,
                field: 'openings',
            },

            status: {
                type: DataTypes.ENUM(
                    'Draft',
                    'Published',
                    'Paused',
                    'Closed',
                    'Expired'
                ),

                allowNull: false,
                defaultValue: 'Draft',
                field: 'status',
            },

            isRemote: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_remote',
            },

            expiresAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'expires_at',
            },
        },

        {
            tableName: 'jobs',

            timestamps: true,

            underscored: true,

            paranoid: true,

            indexes: [
                {
                    fields: ['company_id'],
                },
                {
                    fields: ['status'],
                },
                {
                    fields: ['slug'],
                    unique: true,
                },
                {
                    fields: ['department'],
                },
            ],
        }
    );

    return Job;
};