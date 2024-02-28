const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Item = require("../models/items");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

exports.getAllItems = catchAsync(async (req, res, next) => {
  const items = await Item.find({}, "photo description category item");

  res.status(200).json({
    status: "success",
    total: items.length,
    data: {
      items,
    },
  });
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    return next(new AppError("no item found with taht ID", 400));
  }

  // Remove images from Cloudinary
  for (const photo of item.photo) {
    await cloudinaryRemoveImage(photo.publicId);
  }

  await Item.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Item deleted successfully",
  });
});

exports.Search = catchAsync(async (req, res, next) => {
  const query = req.params.query; // Retrieve the search query from route parameters

  // Perform search using a regex pattern to match the query in the content field
  const item = await Item.find({
    item: { $regex: query, $options: "i" },
  }).select("photo item category description");

  res.status(200).json({
    status: "success",
    results: item.length,
    data: {
      item,
    },
  });
});
