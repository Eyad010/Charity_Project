const BeneFactor = require("../models/beneFactor");
const Item = require("../models/items");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
// const { promisify } = require("util");
// const crypto = require("crypto");

// generate token

const singToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = singToken(user._id);

  // remove password from  output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.singup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, phone } = req.body;

  // Check if email already exists in the database
  const user = await BeneFactor.findOne({ email });

  if (user) {
    return res.status(400).json({
      status: "fail",
      message: "Email is already registered, Please use a different email",
    });
  }

  // create new user
  const newUser = await BeneFactor.create({
    name,
    email,
    password,
    passwordConfirm,
    phone,
  });
  // send jwt to client side with token and user info
  createSendToken(newUser, 201, res);
});

// login

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await BeneFactor.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  // 3) If everything is correct then genereate, save and return the token
  createSendToken(user, 200, res);
});

const imagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/img"));
  },
  filename: (req, file, cb) => {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

// Multer filter to test if the uploaded file is an images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload images only."), false);
  }
};

// multer middleware foe upload images
const uploadImages = multer({
  storage: imagesStorage,
  fileFilter: multerFilter,
});

// const multerStorage = multer.memoryStorage();

// // filter to test if the upload is an image
// const multerFilter = (req, file, cb) => {
//     if(file.mimetype.startsWith('image')){
//       cb(null, true);
//     }else{
//       cb(new AppError("Not an image! Please upload images only.", 400));
//     }
//   };

//   // middleware for upload photo
//   const upload = multer({
//     storage: multerStorage,
//     fileFilter: multerFilter
//   });

exports.uploadItemPhotos = uploadImages.fields([
  { name: "photo", maxCount: 3 },
]);

exports.resizeItemPhoto = catchAsync(async (req, res, next) => {
  if (!req.files.photo)
    return next(new AppError("No files found with given name", 400));

  // 1) Images
  req.body.photo = [];

  await Promise.all(
    req.files.photo.map(async (file, i) => {
      const filename = `item-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      // await sharp(file[0].buffer)
      //   .resize(2000, 1333)
      //   .toFormat("jpeg")
      //   .jpeg({ quality: 90 })
      //   .toFile(`public/img/${filename}`);

      req.body.photo.push(filename);
    })
  );

  next();
});
// for donation
exports.donate = catchAsync(async (req, res, next) => {
  const item = await Item.create({
    name: req.body.name,
    phone: req.body.phone,
    address: req.body.address,
    photo: req.body.photo,
    description: req.body.description,
    category: req.body.category,
  });

  res.status(201).json({
    status: "success",
    data: {
      item,
      message: "We will contact you within two days to receive the item",
    },
  });
});
