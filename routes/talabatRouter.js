const express = require("express");
const talabatController = require("../controllers/talabatController");
const {
  restrictTo,
  protect,
} = require("../controllers/authOrganizationController");

const router = express.Router();

router.post(
  "/talab",
  protect,
  restrictTo("receptionist"),
  talabatController.reqTalab
);

router.get("/getTalabat", protect, talabatController.getTalabat);

router.get("/getTalabatById/:id", protect, talabatController.getTalabatById);

router.patch(
  "/updateTalabRequest/:id",
  protect,
  restrictTo("admin"),
  talabatController.updateTalabRequest
);

router.get("/getViewedTalabat", protect, talabatController.getViewedTalabat);

router.get(
  "/getUnViewedTalabat",
  protect,
  talabatController.getUnViewedTalabat
);

router.delete(
  "/deleteRejectedTalab/:id",
  protect,
  restrictTo("receptionist"),
  talabatController.deleteRejectedTalab
);

module.exports = router;
