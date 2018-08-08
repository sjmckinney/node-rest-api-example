const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const Status = require("../routes/status_codes");
const checkAuth = require("../authentication/check-auth");

router.get("/", checkAuth, (req, res, next) => {
    Order.find()
        .select("product quantity _id")
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(Status.Success).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: "GET",
                            url: `localhost:3000/orders/${doc._id}`
                        }
                    }
                })
            });
        })
        .catch(err => {
            console.log(err);
            res.status(Status.ServerError).json({
                error: err
            });
        });
});

router.post("/", checkAuth, (req, res, next) => {
    // Add check that productId is valid ObjectId
    const productId = req.body.productId;
    if(!mongoose.Types.ObjectId.isValid(productId)){
        return res.status(Status.BadRequest).json({
            message: `Requested product had invalid id ${productId}.`
        });
    }
    // Add check that productId in order request
    // exists before saving order to database
    Product.findById(productId)
        .then(product => {
            // Return 404 if productId not found
            if(!product){
                res.status(Status.NotFound).json({
                    message: `Product with id ${productId} not found.`
                });
            }
            // Product exists so create order
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: productId
            });
            return order.save()
        })
        .then(result => {
            console.log(result);
            res.status(Status.Created).json({
                message: `Created order with id ${result._id}`,
                product: result.product,
                quantity: result.quantity,
                request: {
                    type: "GET",
                    url: `http://localhost:3000/orders/${result._id}`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(Status.ServerError).json({
                error: err
            });
        });
});

router.get("/:orderId", checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .exec()
        .then(result => {
            console.log(result);
            res.status(Status.Success).json({
                message: `Located order with id ${result._id}`,
                product: result.product,
                quantity: result.quantity,
                request: {
                    type: "GET",
                    url: `http://localhost:3000/orders/${result._id}`
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(Status.NotFound).json({
                error: err
            });
        });
});

router.delete("/:orderId", checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({_id: id})
        .exec()
        .then(result => {
            res.status(Status.Success).json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(Status.ServerError).json({
                error: err
            });
        });
});

module.exports = router;
