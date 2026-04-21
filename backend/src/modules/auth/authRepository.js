
'use strict';

const { Op } = require('sequelize');
const { User, Role, RefreshToken } = require('../../database/initModels');

const createUser = (payload, transaction) =>
  User.create(payload, { transaction });

const findUserByEmail = (email) =>
  User.findOne({
    where: { email },
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });

const findUserById = (id) =>
  User.findByPk(id, {
    include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
  });

// const findRoleByName = (name, transaction) =>
//   Role.findOne({ where: { name }, transaction });

const findRoleByName = async (roleName, transaction = null) => {
  console.log('Looking for role:', roleName);

  // ADD THIS 👇
  const allRoles = await Role.findAll();
  console.log('All roles in DB:', JSON.stringify(allRoles, null, 2));

  return await Role.findOne({ where: { name: roleName }, transaction });
};

const persistRefreshToken = (
  { userId, tokenId, tokenHash, ip, userAgent, expiresAt },
  transaction = null,
) =>
  RefreshToken.create(
    { userId, tokenId, tokenHash, ip, userAgent, expiresAt },
    { transaction },
  );

const findRefreshTokenById = ({ tokenId, userId }) =>
  RefreshToken.findOne({ where: { tokenId, userId } });

const revokeRefreshToken = ({ tokenId }, transaction = null) =>
  RefreshToken.update(
    { revokedAt: new Date() },
    { where: { tokenId, revokedAt: null }, transaction },
  );

const revokeAllUserTokens = (userId, transaction = null) =>
  RefreshToken.update(
    { revokedAt: new Date() },
    { where: { userId, revokedAt: null }, transaction },
  );

const linkReplacementToken = ({ tokenId, replacedByTokenId }, transaction = null) =>
  RefreshToken.update(
    { replacedByTokenId },
    { where: { tokenId }, transaction },
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