const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
// const AppError = require('./../utils/appError');

// const tours = JSON.parse(
//  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// 2) ROUTE HANDLERS
// exports.checkBody = (req, res, next) => {
//  if (!req.body.name || !req.body.price) {
//   return res.status(400).json({
//     status: 'fail',
//      message: 'Missing name or price',
//    });
//  }
//  next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// catchAsync(async (req, res, next) => {
//  const tour = await Tour.findById(req.params.id).populate('reviews');
// Tour.findOne({_id: req.params.id})

//  if (!tour) {
//    return next(new AppError('No tour found with that ID', 404));
//  }

//  res.status(200).json({
//    status: 'success',
//    data: {
//      tour,
//    },
//  });
// it is a trick to convert string in the array to a number
// const id = req.params.id * 1;
// find the id in the array
// const tour = tours.find((el) => el.id === id);
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//  const newTour = await Tour.create(req.body);
// const newId = tours[tours.length - 1].id + 1;
// const newTour = Object.assign({ id: newId }, req.body);

//  res.status(201).json({
//    status: 'success',
//   data: {
//      tour: newTour,
//    },
//  });
// });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//    new: true,
//   runValidators: true,
//  });

//  if (!tour) {
//   return next(new AppError('No tour found with that ID', 404));
//  }

//  res.status(200).json({
//    status: 'success',
//    data: {
//      tour,
//   },
//  });
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//  const tour = await Tour.findByIdAndDelete(req.params.id);

// if (!tour) {
//    return next(new AppError('No tour found with that ID', 404));
//  }

//  res.status(204).json({
//    status: 'success',
//    data: null,
//  });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  // aggregation pipeline = doing a regular query, and we can manipulate the data
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: 'price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
