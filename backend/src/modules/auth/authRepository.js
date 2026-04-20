// 'use strict';

// const { Op } = require('sequelize');
// const { User, Role, UserRole, RefreshToken } = require('../../database/initModels');

// const createUser = (payload, transaction) =>
//   User.create(payload, { transaction });

// const findUserByEmail = (email) =>
//   User.findOne({
//     where: { email },
//     include: [{ model: Role, as: 'Roles', attributes: ['id', 'name', 'isPrimary'] }],
//   });

// const findUserById = (id) =>
//   User.findByPk(id, {
//     include: [{ model: Role, as: 'Roles', attributes: ['id', 'name', 'isPrimary'] }],
//   });

// const findRoleByName = (name, transaction) =>
//   Role.findAll({ where: { name }, transaction });

// const assignRoleToUser = (userId, roleId, transaction) =>
//   UserRole.findOrCreate({
//     where: { userId, roleId },
//     defaults: { userId, roleId },
//     transaction,
//   });

// const persistRefreshToken = (
//   { userId, tokenId, tokenHash, ip, userAgent, expiresAt },
//   transaction = null,
// ) =>
//   RefreshToken.create(
//     { userId, tokenId, tokenHash, ip, userAgent, expiresAt },
//     { transaction },
//   );

// const findRefreshTokenById = ({ tokenId, userId }) =>
//   RefreshToken.findOne({ where: { tokenId, userId } });

// const revokeRefreshToken = ({ tokenId }, transaction = null) =>
//   RefreshToken.update(
//     { revokedAt: new Date() },
//     { where: { tokenId, revokedAt: null }, transaction },
//   );

// const revokeAllUserTokens = (userId, transaction = null) =>
//   RefreshToken.update(
//     { revokedAt: new Date() },
//     { where: { userId, revokedAt: null }, transaction },
//   );

// const linkReplacementToken = ({ tokenId, replacedByTokenId }, transaction = null) =>
//   RefreshToken.update(
//     { replacedByTokenId },
//     { where: { tokenId }, transaction },
//   );

// module.exports = {
//   createUser,
//   findUserByEmail,
//   findUserById,
//   findRoleByName,
//   assignRoleToUser,
//   persistRefreshToken,
//   findRefreshTokenById,
//   revokeRefreshToken,
//   revokeAllUserTokens,
//   linkReplacementToken,
// };

const { Op } = require('sequelize');
const { User, Role, UserRole, RefreshToken } = require('../../database/initModels');

const createUser = async (payload, transaction) => User.create(payload, { transaction });

const findUserByEmail = async (email) =>
  User.findOne({
    where: { email },
    include: [{ model: Role, attributes: ['id', 'name'] }]
  });

const findUserById = async (id) =>
  User.findByPk(id, {
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Role, attributes: ['id', 'name'] }]
  });

const findRoleByName = async (name, transaction) =>
  Role.findOrCreate({ where: { name }, defaults: { name }, transaction });

const assignRoleToUser = async (userId, roleId, transaction) =>
  UserRole.findOrCreate({ where: { userId, roleId }, defaults: { userId, roleId }, transaction });

const persistRefreshToken = async ({ userId, tokenId, expiresAt }, transaction) =>
  RefreshToken.create({ userId, tokenId, expiresAt }, { transaction });

const findValidRefreshToken = async ({ tokenId, userId }) =>
  RefreshToken.findOne({
    where: {
      tokenId,
      userId,
      revokedAt: null,
      expiresAt: { [Op.gt]: new Date() }
    }
  });

const revokeRefreshToken = async ({ tokenId, replacedByTokenId = null }) =>
  RefreshToken.update(
    { revokedAt: new Date(), replacedByTokenId },
    {
      where: {
        tokenId,
        revokedAt: null
      }
    }
  );

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findRoleByName,
  assignRoleToUser,
  persistRefreshToken,
  findValidRefreshToken,
  revokeRefreshToken
};