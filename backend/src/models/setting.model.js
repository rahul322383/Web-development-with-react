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
            userId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                field: 'user_id',
                references: { model: 'users', key: 'id' },
            },
            key: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            value: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'settings',
            timestamps: true,
            underscored: true,
            indexes: [
                {
                    unique: true,
                    fields: ['user_id', 'key'], // one key per user
                },
            ],
        }
    );

    return Setting;
};