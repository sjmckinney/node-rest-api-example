const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../../models/order");


//Implement POST and GET routes

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
    const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
    });
    order.save()
        .then(result => {
            console.log(result);
            res.status(201).json(result);
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
    res.status(200).json({
            message: `You passed the order id ${id} to URL '/orders/:orderId'.`
        }) 
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
