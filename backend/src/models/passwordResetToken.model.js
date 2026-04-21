'use strict';

module.exports = (sequelize, DataTypes) => {
    const PasswordResetToken = sequelize.define(
        'PasswordResetToken',
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
            tokenHash: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                field: 'token_hash',
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'expires_at',
            },
            usedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'used_at',
            },
        },
        {
            tableName: 'password_reset_tokens',
            timestamps: true,
            underscored: true,
        }
    );

    return PasswordResetToken;
};