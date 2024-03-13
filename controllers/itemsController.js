const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Item = require("../models/items");
const Talabat = require("../models/talabat");
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

exports.deleteItemAndTalab = catchAsync(async (req, res, next) => {
  const itemId = req.params.id;

  // Find the item
  const item = await Item.findById(itemId);
  if (!item) {
    return next(new AppError("No item found with that ID", 400));
  }

  // Remove images from Cloudinary
  for (const photo of item.photo) {
    await cloudinaryRemoveImage(photo.publicId);
  }

  // Find the talab associated with the item and delete it
  const talab = await Talabat.findOneAndDelete({ item: itemId, value: 1 });

  // Check if the talab was found and deleted
  if (!talab) {
    return next(
      new AppError(
        "This talab has not been seen by the admin Or This talab has been accepted Or No talab found with that ID!",
        400
      )
    );
  }

  // Delete the item
  await Item.findByIdAndDelete(itemId);

  res.status(200).json({
    status: "success",
    message: "Item and associated talab deleted successfully",
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

// get all categories
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Item.distinct("category");

  res.status(200).json({
    status: "success",
    length: categories.length,
    data: {
      categories,
    },
  });
});
