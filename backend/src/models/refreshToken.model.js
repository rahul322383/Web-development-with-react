module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    'RefreshToken',
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
      tokenId: {
        type: DataTypes.STRING(80),
        allowNull: false,
        unique: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      replacedByTokenId: {
        type: DataTypes.STRING(80),
        allowNull: true
      }
    },
    {
      tableName: 'refresh_tokens',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['token_id'], unique: true },
        { fields: ['expires_at'] },
        { fields: ['revoked_at'] }
      ]
    }
  );

  return RefreshToken;
};