const Organization = require("../models/authOrganization");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Talabat = require("../models/talabat");
const { promisify } = require("util");

// generate token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if user still exists
  const currentUser = await Organization.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// singup
exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, phone, address, role } =
    req.body;

  // check if emaiil already exists
  const existingUser = await Organization.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: "fail",
      message:
        "The email address is already registered. Please use a different Email",
    });
  }
  // if every thing is ok
  const newUser = await Organization.create({
    name,
    email,
    password,
    passwordConfirm,
    phone,
    address,
    role,
  });
  // Send back the newly created user and a token
  createSendToken(newUser, 201, res);
});

// login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;
  // 1) check if email and password exists
  if (!email || !password || !role) {
    return next(
      new AppError("Please provide an email, password and role", 400)
    );
  }

  // 2) check if user exist and password correct and role correct
  const user = await Organization.findOne({ email }).select("+password");

  if (
    !user ||
    !(await user.correctPassword(password, user.password)) ||
    !user.correctRole(role)
  ) {
    return next(new AppError("Incorrect Email or Password or Role", 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

// delete employee
exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const emplId = req.params.id;

  await Organization.findByIdAndDelete(emplId);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// restrict to ==> for admin to have a peermation to create employee or to delete employee
exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new AppError(
          "You are not logged in or do not have the correct permissions to perform this action.",
          401
        )
      );
    }

    if (req.user.role !== role) {
      return next(
        new AppError(
          "You do not have the correct permissions to perform this action on this resource.",
          403
        )
      );
    }
    next();
  };
};
