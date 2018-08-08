const mongoose = require("mongoose");
const Product = require("../models/product");
const Status = require("../routes/status_codes");

exports.products_get_all = (req, res, next) => {
    Product.find()
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(Status.Success).json(docs);
        })
        .catch(err => {
            console.log(err);
            res.status(Status.ServerError).json({
                error: err
            });
        });
}

exports.products_create_product = (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(Status.Created).json({
                message: `Created product ${result.name}`,
                createdProduct: product
            })
        })
        .catch(err => {
            console.log(err);
            res.status(Status>ServerError).json({
                error: err
            });
        });
}

exports.products_get_product_by_id = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .exec()
        .then(doc => {
            if(doc){
                console.log("From database: ", doc);
                res.status(Status.Success).json(doc);
            } else {
                res.status(Status.NotFound).json({
                    message: `Valid entry not found for id ${id}`
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(Status.ServerError).json({
                error: err
            });
        });
}

exports.products_update_product_by_id = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            console.log(result);
            res.status(Status.Success).json(result);
        })
        .catch(err => {
            console.log(err);
            res.status(Status.ServerError).json({
                error: err
            });
        });
}

exports.products_delete_product_by_id = (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
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
