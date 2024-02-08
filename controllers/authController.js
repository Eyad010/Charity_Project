const Auth = require('../models/auth');
const jwt = require('jsonwebtoken');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const crypto = require("crypto");

// generate token

const singToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
 
const createSendToken = (user, statusCode, res) => {
    const token = singToken(user._id);

    // remove password from  output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        },
    });

};

exports.singup = catchAsync(async(req, res, next)=> {
    const { name, email, password, passwordConfirm, phone } = req.body;

    // Check if email already exists in the database
    const user = await Auth.findOne({ email });

    if(user) {
     return res.status(400).json({
        status: 'fail',
        message: "Email is already registered, Please use a different email",
     });
}
 
        // create new user
        const newUser = await Auth.create({
            name,
            email,
            password,
            passwordConfirm,
            phone
         });
        // send jwt to client side with token and user info
        createSendToken(newUser, 201 ,res);
});

// login 

exports.login = catchAsync(async(req, res, next) => {
   const { email, password } = req.body;

       // 1) Check if email and password exist
    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    }
      // 2) Check if user exists && password is correct
       const user = await Auth.findOne({ email }).select("+password");

       if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError("Incorrect email or password", 401));
      }
      // 3) If everything is correct then genereate, save and return the token
      createSendToken(user, 200, res);
});