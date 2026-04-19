
const { Sequelize } = require('sequelize');
const env = require('../config/env');
const logger = require('../config/logger');

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',

  logging: env.NODE_ENV === 'development'
    ? (sql) => logger.debug({ sql }, 'sql-query')
    : false,
  logging: false,
  // logging:console.log,
 

  pool: {
    max: env.DB_POOL_MAX,
    min: env.DB_POOL_MIN,
    acquire: 30000,
    idle: 10000
  },
  define: {
    underscored: true,
    timestamps: true,
    paranoid: true
  }
});

module.exports = sequelize;