const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;

  const extValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimeValid = allowedTypes.test(file.mimetype);

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    return cb(
      new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type')
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('file');

// Wrapper to convert multer errors into response
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: 'File upload error',
        error: err.message
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file upload',
        error: err.message
      });
    }

    next();
  });
};

module.exports = uploadMiddleware;