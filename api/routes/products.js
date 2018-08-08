const express = require("express");
const router = express.Router();

const checkAuth = require("../authentication/check-auth");
const ProductController = require("../controllers/products");

router.get("/", ProductController.products_get_all);

router.post("/", checkAuth, ProductController.products_create_product);

router.get("/:productId", ProductController.products_get_product_by_id);

router.patch("/:productId", checkAuth, ProductController.products_update_product_by_id);

router.delete("/:productId", checkAuth, ProductController.products_delete_product_by_id);

module.exports = router;
