## NODE REST API EXAMPLE

This is a simplistic example involving only products, orders and users. Whilst this allows many concepts of API end point desgin to be illustrated the final version leaves a lot to be desired in terms of best practice.

This application user Express as web application framework. This makes 'routing' simple and allows the simple use of Json Web Tokens as an authentication method. It is a simple matter to selectively implement route handlers using Express's _middleware_ pattern.

### Getting Started

* Create a [MongoDb Altas](https://www.mongodb.com/cloud/atlas) account. A free instance with 512Mb of storage can created on selected AWS regions. Follow the sign up instructions carefully to ensure you select one of the free regions. Create a simple user with read/write priveleges and copy the connection to _app.js_ file. Other MongoDb hosting providers are available.

* Clone the repo locally and open a terminal or cmd window within the cloned directory.

* Create the file 'nodemon.json' in the root directory of the project and add the following code substituting in the appropriate values in the second part of each line. There after use ```process.env.JWT_KEY``` etc. to refer to these values in code. This file is excluded from being pushed back to the repo by an entry in the _.gitignore_ file.

```json
{
    "env": {
        "MONGODB_ATLAS_CONNECTION_PWD": "my_password_value",
        "JWT_KEY": "my_secret_value"
    }
}
```
* Run `npm install` to install all the required node packages.

* Run `npm start` to start the application responding on _https://localhost:3000_.

* Alternately run the following substituting in the appropriate values

`PORT=3001 MONGODB_ATLAS_CONNECTION_PWD=<my password value> JWT_KEY=<my secret value> node server.js`

The latter will allow the port the web app connects on to be specified on the command line otherwise it will default to _3000_.

* Use an http client or an app like Postman to create the requests to create products, users and orders that will illustrate the working of this application.

### Useful Addons

#### nodemon

The nodemon package is being used to start the server rather than node directly. As it does so when file changes are detected it saves having to stop and start the server manually. It also allows `process.env` variables to be defined in a seperate file to store db connection passwords and secrets outside of the code base (if you remember to add _nodemon.json_ to your _.gitignore_ file.

#### morgan

The morgan package is used to log the request and results to the console. An instance is created in app.js and acts as proxy for all http commands routed through the server.

#### Package.json scripts

"run": "nodemon server.js"

"debug": "nodemon --inspect server.js"

### Data Persistence With MongoDb Atlas and Mongoose

Create a connection to db in app.js using the string taken from the _MongoDb Atlas_ admin web page.
```javascript
mongoose.connect(`mongodb+srv://api-rest-rw-user:${process.env.MONGODB_ATLAS_CONNECTION_PWD}@cluster0-nebbb.mongodb.net/test?retryWrites=true`, { useNewUrlParser: true });
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

To start in debug node issue the command;

`./node_modules/nodemon/bin/nodemon.js --inspect server.js`

It might be more convenient to create a script named `debug` in _package.json_ and call it via `npm run debug`.
```json
"scripts": {
    ...
    "debug": "nodemon --inspect server.js"
}
```
Then initiate a call to an endpoint using an external tool. Having selected the _Debug view_ select the _Node: Nodemon_ entry from the drop down and start the debug session (click the green button or _F5_).

This will cause a dropdown to appear that will list all the running processes. Select the one that contains the text `node --inspect server.js`. The process should continue to hit the first breakpoint.

### Security

#### Cross-origin resource sharing (CORS)

CORS restrictions are set by the browser and can be overriden by setting the appropriate headers in the app.

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

#### Securing Routes With Json Web Tokens (JWT)

API end points do not use sessions and yet some form of authentication is often desirable.

Not all routes need protecting; GET all products and GET a product by id do not require protection as there are many scenarios where an unauthenticated user should have read-only access to browse or search collections.

The remaining product end points and all order end points should be protected from unauthenticated access.

When used for authentication, once the user has successfully logged in using their credentials, a JWT will be returned. Best practice is to expire the JWT after a period to prevent its unauthorized reuse.

Whenever the user wants to access a protected route or resource, the user agent should send the JWT, typically in the Authorization header using the Bearer schema. The content of the header should look like the following:

`Authorization: Bearer <token value>`

This can be, in certain cases, a stateless authorization mechanism. The server's protected routes will check for a valid JWT in the Authorization header, and if it's present, the user will be allowed to access protected resources.

A JWT is generated following successful authenication of the user in the following way;

```javascript
if(result) {
            const token = jwt.sign({
                email: user[0].email,
                userId: user[0]._id
            },
            process.env.JWT_KEY,
            {
                expiresIn: "1h"
            }
            );
            return res.status(Status.Success).json({
                message: "User authentication succeeded",
                token: token
            });
        }
```

The authentication function `checkAuth` is, as per the 'Express' pattern, used as _middleware_ and inserted into the parameters for the end points concerned.

```javascript
router.post("/", checkAuth, (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result => {
        ...
```
Using the JWT method `verify` the value contained in the _authorization_ header is decoded back into its constituent parts; _header_, _payload_ & _signature_.

If the token has expired then a `TokenExpiredError` will be thrown and the `verify` method will return false. If the signature part of token matches the result of hashing the _header_ and _payload_ sections of the token with the same secret that was used to create the token when it was issued at login then it is valid.
