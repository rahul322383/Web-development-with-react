const leaveService = require('../../modules/leave/service/leaveService');
const logger = require('../../config/logger');

const processLeaveResetJob = async (_job) => {
  const targetYear = new Date().getFullYear();
  logger.info({ targetYear }, 'Processing leave reset job');
  const count = await leaveService.yearlyLeaveReset(targetYear);
  return { resetCount: count, targetYear };
};

module.exports = processLeaveResetJob;