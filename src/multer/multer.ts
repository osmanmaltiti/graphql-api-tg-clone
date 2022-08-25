import { existsSync, mkdirSync } from 'fs';
import multer from 'multer';
import path from 'path';

export const profileStorage = multer.diskStorage({
  destination(req, _, callback) {
    const type = req.headers.type;

    if (type === 'profile') {
      const imagePath = path.resolve(__dirname, `../../public/profile`);

      if (!existsSync(imagePath)) mkdirSync(imagePath);

      callback(null, imagePath);
    } else {
      const imagePath = path.resolve(__dirname, `../../public/posts`);

      if (!existsSync(imagePath)) mkdirSync(imagePath);

      callback(null, imagePath);
    }
  },
  filename(req, _, callback) {
    const { id, type } = req.headers;

    if (type === 'profile') {
      callback(null, `profile-${id}`);
    } else {
      callback(null, `post-${Date.now()}`);
    }
  },
});
