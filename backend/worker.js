const { Worker } = require('bullmq');
const logger = require('./src/config/logger');
const { redisConnectionOptions } = require('./src/redis/redisClient');
const processPayrollJob = require('./jobs/processors/payrollProcessor');
const processLeaveResetJob = require('./jobs/processors/leaveResetProcessor');
const processYearEndJob = require('./jobs/processors/yearEndProcessor');

const buildWorker = (queueName, processor) => {
  const worker = new Worker(queueName, processor, { connection: redisConnectionOptions });

  worker.on('completed', (job) => {
    logger.info({ queueName, jobId: job.id }, 'Worker completed job');
  });

  worker.on('failed', (job, error) => {
    logger.error({ queueName, jobId: job?.id, error }, 'Worker failed job');
  });

  return worker;
};

buildWorker('payroll-processing', processPayrollJob);
buildWorker('leave-reset', processLeaveResetJob);
buildWorker('year-end-summary', processYearEndJob);

logger.info('Worker started');