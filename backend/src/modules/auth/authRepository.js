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