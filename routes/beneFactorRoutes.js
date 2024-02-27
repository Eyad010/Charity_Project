const express = require("express");
const beneFactorController = require("../controllers/beneFactorController");

const router = express.Router();

router.post("/singup", beneFactorController.singup);
router.post("/login", beneFactorController.login);

router.post(
  "/donate",
  beneFactorController.uploadItemPhotos,
  beneFactorController.resizeItemPhoto,
  beneFactorController.donate
);

module.exports = router;
