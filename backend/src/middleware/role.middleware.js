const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: user not found'
      });
    }
    console.log("role middle", req.user || req.user.role )

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you do not have permission to perform this action'
      });
    }

    next();
  };
};

module.exports = { restrictTo };