const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

// router.param('id', tourController.checkID);

// -------- Nested routes for reviews ----------- //

// POST /tour/234fad4/reviews --> nested route
// GET /tour/234fad4/reviews --> get us all the reviews for this tour

// router
//  .route('/:tourId/reviews')
//  .post(
//    authController.protect,
//    authController.restrictTo('user'),
//    reviewController.createReview
//  );

// for this specific route, we want to use reviewRouter
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
