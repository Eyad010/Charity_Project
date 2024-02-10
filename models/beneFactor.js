const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const beneFactorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'Please provide your email address'],
        validate: [validator.isEmail, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: 6,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: "Passwords are not the same!!!"
        }
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
    }
});

// use document middleware to encrypt the password
beneFactorSchema.pre("save", async function (next) {
    // only run this function if password was actully modified
    if (!this.isModified("password")) return next();
  
    // hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
  
    // no longer needed it, a have the real password hashed
    this.passwordConfirm = undefined;
    next();
  });

  beneFactorSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
  });
  
  // instance method that is gonne be available on all documents
  // password that the user enter and the password in the database
  beneFactorSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
  ) {
    return await bcrypt.compare(candidatePassword, userPassword);
  };

const BeneFactor = mongoose.model("BeneFactor", beneFactorSchema);
module.exports = BeneFactor;
