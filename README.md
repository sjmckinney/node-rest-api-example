##NODE REST EXAMPLE

Uses Express as webserver.

API folder contains route code broken down by endpoint e.g. '/Products' etc.

'server.js' contains code that code that sets up server with configuration whilst 'app.js' is the main entry point for the API routing code.

The nodemon package is being used to restart the server when file changes are saved.

A script called "run" has been added to package.json passing server.js as the argument to nodemon on starting the application.

The morgan package is used to log the request and results to the console. An instance is created in app.js and acts as proxy for all commands routed through the server.

CORS (Cross-origin resource sharing) restrictions are set by the browser and can be overriden by setting the appropriate headers in the app.

```javascript
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});
```