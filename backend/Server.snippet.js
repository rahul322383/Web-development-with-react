/**
 * server.js  — ADD these lines
 *
 * The notification listener must be required ONCE at startup,
 * after the DB is connected and socket is initialised.
 */

// ── STEP 1: Somewhere near the top of server.js, add this require ─────────────
require('./src/modules/notification/notificationListener');

// ── STEP 2: Your server.js probably looks like this already ──────────────────
/*
const { createServer } = require('http');
const app    = require('./app');
const { initSocket } = require('./src/config/socket');

const httpServer = createServer(app);
initSocket(httpServer);                            // init socket FIRST

require('./src/modules/notification/notificationListener');   // ← ADD HERE

httpServer.listen(process.env.PORT || 8001, () => {
  console.log(`Server running on port ${process.env.PORT || 8001}`);
});
*/

// ── STEP 3: Emit events from your other services ──────────────────────────────
// In leaveService.js when approved:
//   eventBus.emit('LEAVE_APPROVED', { leaveRequest, employee, approver });
//
// In attendanceService.js when late:
//   eventBus.emit('ATTENDANCE_CHECKED_IN_LATE', { employeeId, date, lateMinutes });
//
// In expenseService.js when submitted:
//   eventBus.emit('EXPENSE_SUBMITTED', { expense, employee });
//
// Payroll events already emit correctly from payrollService.js


// ── STEP 4: .env additions needed ─────────────────────────────────────────────
/*
# SMS (optional — leave blank to disable)
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_FROM_NUMBER=+1234567890

# Branding (used in email templates)
COMPANY_NAME=YourCompany Pvt. Ltd.
COMPANY_ADDRESS=Mumbai, Maharashtra
COMPANY_EMAIL=hr@yourcompany.com
BRAND_COLOR=#1e3a5f
*/


// ── STEP 5: Install Twilio (only if using SMS) ────────────────────────────────
// npm install twilio