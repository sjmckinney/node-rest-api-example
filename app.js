const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/users");
const Status = require("./api/routes/status_codes");

let protocol, user, password, host;

// Make use of morgan and body-parser imports

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set up db connection

switch(process.env.NODE_ENV) {
    case "LOCAL":
        protocol = "mongodb";
        user = "user";
        password = process.env.MONGODB_LOCAL_PWD;
        host = "localhost:27017";
        break;
    case "REMOTE":
        protocol = "mongodb+srv";
        user = "api-rest-rw-user";
        password = process.env.MONGODB_ATLAS_CONNECTION_PWD;
        host = "cluster0-nebbb.mongodb.net";
        break;
    default:
        console.log(`Value of NODE_ENV ${process.env.NODE_ENV} is not recognised`);
}

const connection_string = `${protocol}://${user}:${password}@${host}/test?retryWrites=true`;
mongoose.connect(connection_string, { useNewUrlParser: true });

console.log(`Current value of NODE_ENV: ${process.env.NODE_ENV} & connection string: ${connection_string}`)

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