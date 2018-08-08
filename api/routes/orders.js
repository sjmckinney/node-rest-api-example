const express = require("express");
const router = express.Router();

const checkAuth = require("../authentication/check-auth");
const OrderController = require("../controllers/orders");

router.get("/", checkAuth, OrderController.orders_get_all);

router.post("/", checkAuth, OrderController.orders_create_order);

router.get("/:orderId", checkAuth, OrderController.orders_get_order_by_id);

router.delete("/:orderId", checkAuth, OrderController.orders_delete_order_by_id);

module.exports = router;
