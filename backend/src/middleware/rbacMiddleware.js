// const AppError = require('../utils/AppError');

// const authorize = (...allowedRoles) => (req, res, next) => {
//   try {
//     if (!req.user || !allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Forbidden: You do not have permission to access this resource',
//         data: null
//       });
//     }
//     return next();
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: 'Authorization middleware error',
//       data: null
//     });
//   }
// };

// module.exports = authorize;


const getRoles = (user) => {
  if (!user) return [];

  // support multi-role future
  if (Array.isArray(user.roles)) {
    return user.roles.map(r => String(r.name).trim());
  }

  // current JWT structure
  const role = user.primaryRole || user.role;

  if (!role) return [];

  // always return array
  return [String(role).trim()];
};

// -----------------------------
// RBAC Middleware
// -----------------------------
const authorize = (...allowedRoles) => (req, res, next) => {
  try {
    const roles = getRoles(req.user);

    console.log("🔐 RBAC ROLE(S):", roles);
    console.log("🎯 ALLOWED:", allowedRoles);

    if (!req.user || roles.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: no user found in request',
        data: null
      });
    }

    const isAllowed = roles.some(role =>
      allowedRoles.some(allowed =>
        String(allowed).toLowerCase() === String(role).toLowerCase()
      )
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role ${roles.join(',')} not allowed`,
        data: null
      });
    }

    return next();

  } catch (err) {
    console.error("❌ RBAC ERROR:", err);

    return res.status(500).json({
      success: false,
      message: 'Authorization middleware error',
      data: null
    });
  }
};

module.exports = authorize;