'use strict';

module.exports = (sequelize, DataTypes) => {
    const Setting = sequelize.define(
        'Setting',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },

            scopeType: {
                type: DataTypes.ENUM(
                    'global',
                    'company',
                    'department',
                    'role',
                    'user'
                ),
                allowNull: false,
                defaultValue: 'user',
                field: 'scope_type',
            },

            scopeId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
                field: 'scope_id',
            },

            category: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },

            key: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },

            value: {
                type: DataTypes.JSON,
                allowNull: true,
            },

            datatype: {
                type: DataTypes.ENUM(
                    'string',
                    'number',
                    'boolean',
                    'json'
                ),
                defaultValue: 'string',
            },
        },
        {
            tableName: 'settings',
            timestamps: true,
            underscored: true,

            indexes: [
                {
                    unique: true,
                    fields: [
                        'scope_type',
                        'scope_id',
                        'category',
                        'key',
                    ],
                },
            ],
        }
    );

    return Setting;
};