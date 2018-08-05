const express = require("express");
const app = express();
const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const morgan = require("morgan");

// POC code
/* app.use((req, res, next) => {
    res.status(200).json({
        message: "It works"
    });
}); */

//Prod code
/** 1st arguemnt is a filter for urls containing "products"
 *  the 2nd arguement is a reference to the functionality
 *  that will handle the GET request e.g. products.js, orders.js etc.
 **/
app.use(morgan("dev"));
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

// Capture attempts to use endpoints that do not exist

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

// Capture any other errors that arise.

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;