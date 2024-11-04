// import multer from 'multer';

// const storage = multer.diskStorage({
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// });

// const upload = multer({ storage: storage });

// export default upload;



import multer from 'multer';

// Set up storage configuration
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Define a file size limit in bytes (e.g., 100 MB = 100 * 1024 * 1024 bytes)
const fileSizeLimit = 100 * 1024 * 1024; // 100 MB

// Initialize multer with storage and limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: fileSizeLimit // Set the file size limit
  },
  fileFilter: function (req, file, cb) {
    // Define allowed file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mkv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and video files are allowed.'));
    }
  }
});

export default upload;
