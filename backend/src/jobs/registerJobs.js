const cron = require('node-cron');
const { payrollQueue, leaveResetQueue, yearEndQueue } = require('../redis/queues');
const logger = require('../config/logger');

const registerScheduledJobs = () => {
  cron.schedule('0 2 1 * *', async () => {
    const now = new Date();
    await payrollQueue.add('monthly-payroll', { month: now.getMonth() + 1, year: now.getFullYear() });
    logger.info('Scheduled payroll job queued');
  });

  cron.schedule('0 3 1 1 *', async () => {
    await leaveResetQueue.add('yearly-leave-reset', {});
    logger.info('Scheduled leave reset job queued');
  });

  cron.schedule('0 4 2 1 *', async () => {
    const previousYear = new Date().getFullYear() - 1;
    await yearEndQueue.add('year-end-summary', { year: previousYear });
    logger.info('Scheduled year-end summary job queued');
  });
};

module.exports = registerScheduledJobs;