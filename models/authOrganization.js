const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "Please provide your email address"],
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: 6,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!!!",
    },
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  address: {
    type: String,
    required: [true, "Please provide your address"],
  },
  role: {
    type: String,
    enum: ["admin", "receptionist", "store employee"],
    default: "admin",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// use document middleware to encrypt the password
organizationSchema.pre("save", async function (next) {
  // only run this function if password was actully modified
  if (!this.isModified("password")) return next();

  // hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // no longer needed it, a have the real password hashed
  this.passwordConfirm = undefined;
  next();
});

// run before saving a document to the database
//  if the "password" field is being modified and it's not a new document
organizationSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// instance method that is gonne be available on all documents
// password that the user enter and the password in the database
organizationSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check if role correct
organizationSchema.methods.correctRole = function (candidateRole) {
  // Retrieve the organization's role from the database
  const userRole = this.role;

  // Check if both candidateRole and userRole are defined and not null
  if (!candidateRole || !userRole) {
    return false; // Or you can throw an error
  }

  // Compare the candidateRole with the userRole
  return candidateRole === userRole;
};

organizationSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

organizationSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const Organization = mongoose.model("Organization", organizationSchema);

module.exports = Organization;
