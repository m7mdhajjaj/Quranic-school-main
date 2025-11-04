const express = require('express');
const router = express.Router();
const {
  uploadActivity,
  uploadNews,
  uploadHero,
  uploadLogo,
  uploadAvatar,
} = require('../../config/multer');
const { protect } = require('../../middleware/authMiddleware');
const {
  uploadActivityImage,
  uploadNewsImage,
  uploadMultipleActivityImages,
  uploadMultipleNewsImages,
  uploadHeroImage,
  getHeroImage,
  uploadLogo: uploadLogoHandler,
  getLogo,
  uploadAvatarSimple,
  deleteImage,
} = require('../../controllers/uploadController');

// ============= Activity Image Routes =============
router.post('/activity', uploadActivity.single('image'), uploadActivityImage);
router.post(
  '/activity/multiple',
  uploadActivity.array('images', 5),
  uploadMultipleActivityImages
);

// ============= News Image Routes =============
router.post('/news', uploadNews.single('image'), uploadNewsImage);
router.post(
  '/news/multiple',
  uploadNews.array('images', 5),
  uploadMultipleNewsImages
);

// ============= Hero Image Routes =============
router.post('/hero', uploadHero.single('image'), uploadHeroImage);
router.get('/hero', getHeroImage);

// ============= Logo Routes =============
router.post('/logo', uploadLogo.single('image'), uploadLogoHandler);
router.get('/logo', getLogo);

// ============= Avatar Routes  =============
router.post(
  '/avatar',
  protect,
  uploadAvatar.single('image'),
  uploadAvatarSimple
);

// ============= Delete Image Route =============
router.delete('/:publicId', deleteImage);

module.exports = router;
