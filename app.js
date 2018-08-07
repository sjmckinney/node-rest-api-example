const express = require("express");
const app = express();
const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/users");
const Status = require("./api/routes/status_codes");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");

// Make use of morgan and body-parser imports

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set up db connection

mongoose.connect(`mongodb+srv://api-rest-rw-user:${process.env.MONGODB_ATLAS_CONNECTION_PWD}@cluster0-nebbb.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true });

// Dealing with CORS

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(Status.Success).json({});
    }
    next();
});

/** 
 *  1st argument is a filter for urls containing "products"
 *  whilst the 2nd argument is a reference to the functionality
 *  that will handle the various requests e.g. products.js, orders.js etc.
 **/

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);

// Capture attempts to use endpoints that do not exist

app.use((req, res, next) => {
    const error = new Error(`End point '${req.protocol}://${req.hostname}:${req.socket.localPort+req.path}' not found.`);
    error.status = Status.NotFound;
    next(error);
});

// Capture any other errors that arise.

app.use((error, req, res, next) => {
    res.status(error.status || Status.ServerError);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;