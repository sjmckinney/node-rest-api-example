const jwt = require("jsonwebtoken");
const Status = require("../routes/status_codes");

module.exports = (req, res, next) => {
    try{
        // Retrieve constant value from Authorization header
        // splitting out 'Bearer' prefix
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch(err) {
        console.log(`Error.name: ${err.name}\r\nError.message: ${err.message}`);
        return res.status(Status.Unauthorized).json({
            message: "Authentication failed",
            error: err.message
        });
    }
};