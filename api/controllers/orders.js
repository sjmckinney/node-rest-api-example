const mongoose = require("mongoose");
const Order = require("../models/order");
const Product = require("../models/product");
const Status = require("../routes/status_codes");

exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select("product quantity _id")
        .exec()
        .then(orders => {
            console.log(orders);
            res.status(Status.Success).json({
                count: orders.length,
                orders: orders.map(order => {
                    return {
                        _id: order._id,
                        product: order.product,
                        quantity: order.quantity,
                        request: {
                            type: "GET",
                            url: `localhost:3000/orders/${order._id}`
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
}

exports.orders_create_order = (req, res, next) => {
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
}

exports.orders_get_order_by_id = (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .exec()
        .then(result => {
            // If order has been deleted the result will be null
            // so throw error to get correct error message
            if(!result){
                throw new Error("Order does not exist");
            }
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
                error: err.message
            });
        });
}

exports.orders_delete_order_by_id = (req, res, next) => {
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
}
