const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");

router.get("/", (req, res, next) => {
    Order.find()
        .select("product quantity _id")
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json({
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
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post("/", (req, res, next) => {
    // Add check that productId is valid ObjectId
    const productId = req.body.productId;
    if(!mongoose.Types.ObjectId.isValid(productId)){
        return res.status(400).json({
            message: `Requested product had invalid id ${productId}.`
        });
    }
    // Add check that productId in order request
    // exists before saving order to database
    Product.findById(productId)
        .then(product => {
            // Return 404 if productId not found
            if(!product){
                res.status(404).json({
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
            res.status(201).json({
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
            res.status(500).json({
                error: err
            });
        });
});

router.get("/:orderId", (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: `Located order with id ${result._id}`,
                product: result.product,
                quantity: result.quantity,
                request: {
                    type: "GET",
                    url: `http://localhost:3000/orders/${result._id}`
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(404).json({
                error: err
            })
        });
});

router.delete("/:orderId", (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

module.exports = router;
