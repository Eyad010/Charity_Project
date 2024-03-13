const mongoose = require("mongoose");

const talabatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  phone: { type: String },
  item: {
    type: mongoose.Schema.ObjectId,
    ref: "Item",
    required: [true, "Please provide your Talab"],
  },
  maritalStatus: {
    type: String,
    enum: ["Single", "Married", "divorced"],
    required: [true, "What is your marital status?"],
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: [true, "What is your gender?"],
  },
  birthDate: {
    type: Date,
    required: [true, "When were you born?"],
  },
  address: { type: String },
  yourJob: {
    type: String,
    required: [true, "What is your Job Title"],
  },
  empOpinion: {
    type: String,
    required: true,
  },
  extraInfo: { type: String },
  value: {
    type: Number,
    default: -1, //-1 means not rated yet
  },
});

talabatSchema.pre(/^find/, function (next) {
  this.populate({
    path: "item",
    select: "photo item description category ",
  });
  next();
});

const Talabat = mongoose.model("Talabat", talabatSchema);

module.exports = Talabat;
