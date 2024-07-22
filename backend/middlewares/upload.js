const multer = require("multer");
const path = require("path"); // Import path module

// Set storage engine
const storage = multer.memoryStorage(); // Store files in memory

// Check file type
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check file extension
  const mimetype = filetypes.test(file.mimetype); // Check MIME type

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only!")); // Pass error to callback
  }
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb); // Use the file type check function
  },
});

module.exports = upload;
