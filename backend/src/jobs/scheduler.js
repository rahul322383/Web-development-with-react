const cron = require('node-cron');
const logger = require('../utils/logger');
const User = require('../models/User');
const Payroll = require('../models/Payroll');
const YearEndSummary = require('../models/YearEndSummary');

const resetLeaveBalances = async () => {
  try {
    logger.info('Starting yearly leave balance reset job');

    const result = await User.updateMany(
      { isDeleted: false },
      {
        $set: {
          'leaveBalance.casual': 12,
          'leaveBalance.sick': 10,
          'leaveBalance.annual': 15,
        },
      }
    );

    logger.info(`Leave balances reset for ${result.modifiedCount} users`);
  } catch (error) {
    logger.error('Error resetting leave balances:', error);
  }
};

const processMonthlyPayroll = async () => {
  try {
    logger.info('Starting monthly payroll processing job');

    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const users = await User.find({ isDeleted: false, isActive: true });

    let processedCount = 0;
    for (const user of users) {
      const existing = await Payroll.findOne({ userId: user._id, month, year });
      if (!existing) {
        await Payroll.create({
          userId: user._id,
          month,
          year,
          baseSalary: user.salary,
          bonuses: 0,
          deductions: 0,
          netSalary: user.salary,
          status: 'pending',
        });
        processedCount++;
      }
    }

    logger.info(`Payroll processed for ${processedCount} users`);
  } catch (error) {
    logger.error('Error processing monthly payroll:', error);
  }
};

const generateYearEndSummaries = async () => {
  try {
    logger.info('Starting year-end summary generation job');

    const previousYear = new Date().getFullYear() - 1;
    const users = await User.find({ isDeleted: false });

    let generatedCount = 0;
    for (const user of users) {
      const existing = await YearEndSummary.findOne({ userId: user._id, year: previousYear });
      if (!existing) {
        generatedCount++;
      }
    }

    logger.info(`Year-end summaries would be generated for ${generatedCount} users`);
  } catch (error) {
    logger.error('Error generating year-end summaries:', error);
  }
};

const startScheduler = () => {
  cron.schedule('0 0 1 1 *', resetLeaveBalances);
  logger.info('Scheduled: Leave balance reset job (1st Jan every year)');

  cron.schedule('0 0 1 * *', processMonthlyPayroll);
  logger.info('Scheduled: Monthly payroll processing job (1st of every month)');

  cron.schedule('0 0 10 1 *', generateYearEndSummaries);
  logger.info('Scheduled: Year-end summary generation job (10th Jan every year)');
};

module.exports = { startScheduler, resetLeaveBalances, processMonthlyPayroll, generateYearEndSummaries };
