const express = require("express");
const router = express.Router();

//Implement POST and GET routes

router.get("/", (req, res, next) => {
    res.status(200).json({
        message: "Handling GET requests to URL '/orders'."
    })
});

router.post("/", (req, res, next) => {
    res.status(201).json({
        message: "Handling POST requests to URL '/orders'."
    })
});

router.get("/:orderId", (req, res, next) => {
    const id = req.params.orderId;
    res.status(200).json({
            message: `You passed the order id ${id} to URL '/orders/:orderId'.`
        }) 
});

router.delete("/:orderId", (req, res, next) => {
    const id = req.params.orderId;
    res.status(200).json({
            message: `You deleted the order with id ${id}.`
        }) 
});

module.exports = router;
