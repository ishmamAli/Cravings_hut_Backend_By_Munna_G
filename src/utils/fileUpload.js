const multer = require("multer");
const path = require("path");

const multerFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },

  // By default, multer removes file extensions so let's add them back
  filename: (req, file, cb) => {
    // eslint-disable-next-line prefer-template
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const pdfFileFilter = (req, file, cb) => {
  // Accept pdf nly
  if (!file.originalname.match(/\.(pdf|PDF)$/)) {
    req.fileValidationError = "Only pdf files are allowed!";
    return cb(new Error("Only pdf files are allowed!"), false);
  }
  cb(null, true);
};

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    return cb(new Error("Only image files are allowed!"), false);
  }
};

const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    return cb(new Error("Only video files are allowed!"), false);
  }
};

// Combined File Filter (Image, Video, PDF)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    return cb(new Error("Only images, videos, and PDFs are allowed!"), false);
  }
};

// Multer Uploads
const fileUpload = multer({ storage: multerFileStorage, fileFilter: fileFilter });
const imageUpload = multer({ storage: multerFileStorage, fileFilter: imageFilter });
const videoUpload = multer({
  storage: multerFileStorage,
  fileFilter: videoFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 1,
  },
});
const pdfUpload = multer({ storage: multerFileStorage, fileFilter: pdfFileFilter });

module.exports = {
  fileUpload,
  imageUpload,
  videoUpload,
  pdfUpload,
};
