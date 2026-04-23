
const express = require('express');
const requestLogger = require('./src/middleware/requestLogger');
const sanitizeMiddleware = require('./src/middleware/sanitize.middleware'); // ✅ ADDED
const errorMiddleware = require('./src/middleware/error.middleware');
const { helmetMiddleware, corsMiddleware, globalLimiter } = require('./src/config/security');
const env = require('./src/config/env');

const healthRoutes = require('./src/routes/healthRoutes');
const v1Routes = require('./src/routes/v1.routes');
const AppError = require('./src/utils/AppError');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

/* -------------------- SWAGGER CONFIG -------------------- */

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS Backend API',
      version: '1.0.0',
      description: 'Enterprise HR Management System API Documentation',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}${env.API_PREFIX}`,
      },
    ],
  },
  apis: ['./src/modules/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/* -------------------- MIDDLEWARE -------------------- */

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(globalLimiter);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// 🔥 ADD THIS
app.use(sanitizeMiddleware);

app.use(requestLogger);

/* -------------------- API DOCS -------------------- */

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* -------------------- ROUTES -------------------- */

app.use(healthRoutes);
app.use(env.API_PREFIX, v1Routes);

/* -------------------- 404 HANDLER -------------------- */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    errors: [
      {
        field: 'route',
        message: `${req.originalUrl} does not exist`,
      },
    ],
  });
});
/* -------------------- ERROR HANDLER -------------------- */

app.use(errorMiddleware);

module.exports = app;