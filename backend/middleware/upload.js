const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure directory exists
const uploadDir = 'uploads/dentist-profiles';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types
const ALLOWED_MIMETYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

// Allowed extensions
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create secure unique filename using crypto
        const uniqueId = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        // Sanitize: only allow alphanumeric and specific chars
        cb(null, `dentist-${uniqueId}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Check MIME type
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }

    // Check extension
    if (!file.originalname.match(ALLOWED_EXTENSIONS)) {
        return cb(new Error('Invalid file extension. Only .jpg, .jpeg, .png, .gif, .webp are allowed.'), false);
    }

    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit (reduced from 5MB for security)
        files: 1 // Only allow 1 file per request
    }
});

module.exports = upload;
