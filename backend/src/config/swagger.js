const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HRMS API",
      version: "1.0.0",
      description: "Enterprise HR Management System API",
    },
    servers: [
      {
        url: "http://localhost:8001/api/v1",
      },
    ],
  },
  apis: ["./src/modules/**/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };