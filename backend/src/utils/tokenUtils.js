const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

const buildAccessToken = (user) => {
  const jti = uuidv4();
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.primaryRole,
      jti,
      companyId: user.company_id,
      type: 'access'
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );



  return { token, jti };
};

const buildRefreshToken = (user) => {
  const tokenId = uuidv4();
  const token = jwt.sign(
    {
      sub: user.id,
      tokenId,
      type: 'refresh'

    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  return { token, tokenId };
};

const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

module.exports = {
  buildAccessToken,
  buildRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};