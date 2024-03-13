const Talabat = require("../models/talabat");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.reqTalab = catchAsync(async (req, res, next) => {
  const talab = await Talabat.create(req.body);

  // Respond with json

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

exports.deleteRejectedTalab = catchAsync(async (req, res, next) => {
  const deletedTalab = await Talabat.findOneAndDelete({
    _id: req.params.id,
    value: 0,
  });

  if (!deletedTalab) {
    return next(
      new AppError(
        "This talab has not been seen by the admin Or This talab has been accepted Or No talab found with that ID!",
        404
      )
    );
  }

  res.status(204).json({
    status: "success",
    data: { deletedTalab },
  });
});
