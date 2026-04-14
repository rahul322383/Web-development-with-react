const yearEndService = require('../modules/yearEnd/yearEndService');
const logger = require('../config/logger');

const processYearEndJob = async (job) => {
  logger.info({ year: job.data.year }, 'Processing year-end summary job');
  const result = await yearEndService.generateYearSummary(job.data.year);
  return { count: result.length, year: job.data.year };
};

module.exports = processYearEndJob;