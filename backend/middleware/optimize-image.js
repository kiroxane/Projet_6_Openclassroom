const sharp = require('sharp');
const path = require('path');

module.exports = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const name = req.file.originalname
      .split(' ')
      .join('_')
      .split('.')[0];
    const filename = `${name}_${Date.now()}.webp`;

    await sharp(req.file.buffer)
      .resize({ width: 500, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join('images', filename));

    req.file.filename = filename;
    next();
  } catch (error) {
    next(error);
  }
};
