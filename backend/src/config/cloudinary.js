const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const useLocalStorage = process.env.STORAGE_MODE === 'local';

const requiredEnv = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnv = requiredEnv.filter(name => !process.env[name]);

if (!useLocalStorage && missingEnv.length > 0) {
  throw new Error(`Missing Cloudinary environment variables: ${missingEnv.join(', ')}`);
}

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const imageFileFilter = (req, file, cb) => {
  if (allowedImageMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error('Only JPG, PNG, and WEBP image files are allowed'), false);
};

if (!useLocalStorage) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const createLocalStorage = (folder) => {
  const uploadDirectory = path.resolve(__dirname, '../../uploads', folder);
  fs.mkdirSync(uploadDirectory, { recursive: true });

  return multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    }
  });
};

const cloudinaryPlaceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'teawinai/places',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
    ]
  }
});

const cloudinaryAvatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'teawinai/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto' }
    ]
  }
});

const storage = useLocalStorage ? createLocalStorage('places') : cloudinaryPlaceStorage;
const avatarStorage = useLocalStorage ? createLocalStorage('avatars') : cloudinaryAvatarStorage;

module.exports = { cloudinary, storage, avatarStorage, imageFileFilter };
