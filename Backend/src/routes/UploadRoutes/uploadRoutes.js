const express = require('express');
const router = express.Router();
const {
  uploadNews,
  uploadHero,
  uploadLogo,
  uploadAvatar,
  uploadWelcomeVideo,
} = require('../../config/cloudinary');
const { protect, isAdmin } = require('../../middleware/auth');
const {
  uploadNewsImage,
  uploadMultipleNewsImages,
  uploadHeroImage,
  getHeroImage,
  getAllHeroImages,
  deleteHeroImage,
  uploadLogo: uploadLogoHandler,
  getLogo,
  uploadAvatarSimple,
  deleteImage,
  uploadWelcomeVideo: uploadWelcomeVideoHandler,
  getWelcomeVideo,
  deleteWelcomeVideo,
} = require('../../controllers/uploadController');



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
router.get('/hero/all', getAllHeroImages);
router.delete('/hero/:publicId', protect, deleteHeroImage);

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

// ============= Welcome Video Routes =============
router.get('/welcome-video', getWelcomeVideo);
router.post(
  '/welcome-video',
  uploadWelcomeVideo.single('video'),
  uploadWelcomeVideoHandler
);
router.delete('/welcome-video', protect, deleteWelcomeVideo);

module.exports = router;
