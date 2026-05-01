import { cloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';

export const uploadImageBuffer = file =>
  new Promise((resolve, reject) => {
    if (!file?.buffer) {
      reject(new Error('No image buffer provided.'));
      return;
    }

    const upload = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.uploadFolder,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          format: result.format
        });
      }
    );

    upload.end(file.buffer);
  });

export const deleteCloudinaryImage = async publicId => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};
