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
  "/deleteItem/:id",
  protect,
  restrictTo("store employee"),
  itemsController.deleteItem
);

module.exports = router;
