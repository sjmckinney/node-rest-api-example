const express = require("express");
const router = express.Router();

//Implement POST and GET routes

router.get("/", (req, res, next) => {
    res.status(200).json({
        message: "Handling GET requests to URL '/products'."
    })
});

router.post("/", (req, res, next) => {
    const product = {
        name: req.body.name,
        price: req.body.price
    };
    res.status(201).json({
        message: "Handling POST requests to URL '/products'.",
        createdProduct: product
    })
});

router.get("/:productId", (req, res, next) => {
    const id = req.params.productId;
    if(id === "special") {
        res.status(200).json({
            message: "You passed a special id to URL '/products'."
        })
    } else {
        res.status(200).json({
            message: `You passed the id ${id} to URL '/products/:productId'.`
        })
    }
    
});

router.patch("/:productId", (req, res, next) => {
    const id = req.params.productId;
    res.status(200).json({
        message: `You have updated the product with id ${id}.`
    })
});

router.delete("/:productId", (req, res, next) => {
    const id = req.params.productId;
    res.status(200).json({
        message: `You have deleted the product with id ${id}.`
    })
});

module.exports = router;
