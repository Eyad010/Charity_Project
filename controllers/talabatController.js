const Talabat = require("../models/talabat");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Item = require("../models/items");

exports.getAllItems = catchAsync(async (req, res, next) => {
  const items = await Item.find();

  res.status(200).json({
    status: "success",
    total: items.length,
    data: {
      items,
    },
  });
});

exports.reqTalab = catchAsync(async (req, res, next) => {
  const talab = await Talabat.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      talab,
    },
  });
});
//get all requests from Talabat
exports.getTalabat = catchAsync(async (req, res, next) => {
  const talabat = await Talabat.find();

  //Sending response
  res.status(200).json({
    status: "success",
    length: talabat.length,
    data: {
      talabat,
    },
  });
});
exports.getTalabatById = catchAsync(async (req, res, next) => {
  const talab = await Talabat.findById(req.params.id);
  if (!talab) {
    return next(new AppError("No Talab found with that ID", 404));
  }
  //Send the request back to the client
  res.status(200).json({
    status: "success",
    data: {
      talab,
    },
  });
});

exports.updateTalabRequest = catchAsync(async (req, res, next) => {
  const talab = await Talabat.findByIdAndUpdate(req.params.id, req.body);
  console.log("NewTalab", newTalab);
  res.status(200).json({
    status: "success",
    message: "Talab updated successfully!",
    data: {
      talab,
    },
  });
});

exports.getViewedTalabat = catchAsync(async (req, res, next) => {
  const talab = await Talabat.find({ value: { $gte: 0 } });

  res.status(200).json({
    status: "success",
    length: talab.length,
    data: {
      talab,
    },
  });
});

exports.getUnViewedTalabat = catchAsync(async (req, res, next) => {
  const talab = await Talabat.find({ value: { $lt: 0 } });

  res.status(200).json({
    status: "success",
    length: talab.length,
    data: {
      talab,
    },
  });
});
