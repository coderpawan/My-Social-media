const multer = require("multer");
const path = require("path");

// Set storage engine - store files in memory for Cloudinary upload
const storage = multer.memoryStorage();

// Check file type - allow images and videos for stories
const checkFileType = (file, cb) => {
    // Allowed file types
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    const videoTypes = /mp4|mov|avi|mkv|webm/;
    
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;
    
    // Check for images
    if (imageTypes.test(extname) && mimetype.startsWith('image/')) {
        return cb(null, true);
    }
    
    // Check for videos
    if (videoTypes.test(extname) && mimetype.startsWith('video/')) {
        return cb(null, true);
    }
    
    cb(new Error("Error: Only images and videos are allowed for stories!"));
};

// Initialize upload for stories
const storyUpload = multer({
    storage: storage,
    limits: { 
        fileSize: 100 * 1024 * 1024 // 100 MB for videos
    },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
});

module.exports = storyUpload;
