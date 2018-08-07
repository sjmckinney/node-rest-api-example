## NODE REST API EXAMPLE

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

### Data Persistence With MongoDb Atlas and Mongoose

Create a connection to db in app.js using the string taken from the _MongoDb Atlas_ admin web page.
```javascript
    mongoose.connect(`mongodb+srv://api-rest-rw-user:${process.env.MONGODB_ATLAS_CONNECTION_PWD}@cluster0-nebbb.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true });
```
The password value can be held in the file `nodemon.json` and excluded from being psuhed to a repo by adding it to the `.gitignore` file.
```json
    {
        "env": {
            "MONGODB_ATLAS_CONNECTION_PWD": "my_password_value"
        }
    }
```

To work the Mongoose way create a "model" for the objects product and order objects.

Within the 'models/product.js' and 'models/order.js' files define the schema for the product and order objects using Mongoose functionality.

Use methods defined on each schema object to create, find, update and delete objects within the database.

Parameters are passed in the URL for GET and DELETE operations and extracted from the body for all other types.

### Debugging

As the api endpoints are activated by external requests, in order to debug the app must be standed in debug mode and attach to the external process that trigger the call to the endpoint.

To attach to a process the correct configuration must be added to the _launch.json_ file contained in the _.vscode_ directory.

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "attach",
            "name": "Node: Nodemon",
            "processId": "${command:PickProcess}",
            "restart": true,
            "protocol": "inspector"
        }
    ]
}
```

To start in debug node issue the command `./node_modules/nodemon/bin/nodemon.js --inspect server.js` (it might be more convenient to create a script named `debug` in _package.json_ and call it via `npm run debug`).
```json
"scripts": {
    ...
    "debug": "nodemon --inspect server.js"
}
```
Then initiate a call to an endpoint using an external tool. Having selected the _Debug view_ select the _Node: Nodemon_ entry from the drop down and start the debug session (click the green button or _F5_).

This will cause a dropdown to appear that will list all the running processes. Select the one that contains the text `node --inspect server.js`. The process should continue to hit the first breakpoint.