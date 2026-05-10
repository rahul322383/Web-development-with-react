'use strict';

// Bootstrap notifications listener (registers eventBus handlers)
require('./recruitment.notifications');

const routes = require('./recruitment.routes');

module.exports = { routes };