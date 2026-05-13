'use strict';

const { User, Role, RefreshToken } = require('../../database/initModels');

// ======================
// USER
// ======================

const createUser = (payload, transaction = null) =>
  User.create(payload, { transaction });

const findUserByEmail = (email) =>
  User.findOne({
    where: { email },
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name'],
      },
    ],
  });

const findUserById = (id) =>
  User.findByPk(id, {
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['id', 'name'],
      },
    ],
  });

const findRoleByName = (roleName, transaction = null) =>
  Role.findOne({
    where: { name: roleName },
    transaction,
  });

// ======================
// REFRESH TOKENS
// ======================

const persistRefreshToken = (
  {
    userId,
    tokenId,
    tokenHash,
    ip,
    userAgent,
    expiresAt,
  },
  transaction = null,
) =>
  RefreshToken.create(
    {
      userId,
      tokenId,
      tokenHash,
      ip,
      userAgent,
      expiresAt,
    },
    { transaction },
  );

const findRefreshTokenById = ({ tokenId, userId }) =>
  RefreshToken.findOne({
    where: { tokenId, userId },
  });

const revokeRefreshToken = ({ tokenId }, transaction = null) =>
  RefreshToken.update(
    {
      revokedAt: new Date(),
    },
    {
      where: {
        tokenId,
        revokedAt: null,
      },
      transaction,
    },
  );

const revokeAllUserTokens = (userId, transaction = null) =>
  RefreshToken.update(
    {
      revokedAt: new Date(),
    },
    {
      where: {
        userId,
        revokedAt: null,
      },
      transaction,
    },
  );

const linkReplacementToken = (
  { tokenId, replacedByTokenId },
  transaction = null,
) =>
  RefreshToken.update(
    {
      replacedByTokenId,
    },
    {
      where: { tokenId },
      transaction,
    },
  );

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findRoleByName,
  persistRefreshToken,
  findRefreshTokenById,
  revokeRefreshToken,
  revokeAllUserTokens,
  linkReplacementToken,
};