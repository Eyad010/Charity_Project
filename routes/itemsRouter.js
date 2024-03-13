const express = require("express");
const itemsController = require("../controllers/itemsController");
const {
  restrictTo,
  protect,
} = require("../controllers/authOrganizationController");

const router = express.Router();

router.get("/getAllItems", protect, itemsController.getAllItems);
router.get("/search/:query", protect, itemsController.Search);
router.delete(
  "/deleteItemAndTalab/:id",
  protect,
  restrictTo("store employee"),
  itemsController.deleteItemAndTalab
);

router.get("/getAllCategories", protect, itemsController.getAllCategories);

module.exports = router;
