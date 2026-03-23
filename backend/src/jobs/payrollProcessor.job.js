const payrollService = require('../../modules/payroll/service/payrollService');
const logger = require('../../config/logger');

const processPayrollJob = async (job) => {
  logger.info({ jobId: job.id, data: job.data }, 'Processing payroll job');
  const result = await payrollService.processPayrollBatch(job.data);
  return result;
};

module.exports = processPayrollJob;