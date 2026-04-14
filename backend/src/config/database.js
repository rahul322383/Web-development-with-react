const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
