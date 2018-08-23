const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Status = require("../routes/status_codes");

exports.users_get_all = (req, res, next) => {
    User.find()
        .select("id email")
        .exec()
        .then(users => {
            console.log(users);
            res.status(Status.Success).json(users);
        })
        .catch(err => {
            console.log(err);
            res.status(Status.ServerError).json({
                error: err
            });
        });
}

exports.users_sign_up = (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            // Because returned user object is an array need
            // to check is empty as even empty array is truthy
            if(user.length >= 1){
                res.status(Status.UnprocessableEntity).json({
                    message: `User ${req.body.email} already exists in the system.`
                });
            } else {
                // Attempt to hash password first and if succeed
                // save hash of password to database
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err){
                        console.log(err);
                        return res.status(Status.ServerError).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash  
                    });
                    user
                        .save()
                        .then(result => {
                            console.log(result);
                            res.status(Status.Created).json({
                                message: `Created user ${result.email}`
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(Status.ServerError).json({
                                error: err.message
                            });
                        });
                    }
                });
            }
        });
}

exports.users_login = (req, res, next) => {

    var authFailedMsg = "User authentication failed";
    var authSucceededMsg = "User authentication succeeded";

    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length < 1){
                return res.status(Status.Unauthorized).json({
                    message: authFailedMsg
            });    
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                return res.status(Status.Unauthorized).json({
                    message: authFailedMsg
                });
            }
            if(result){
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
                    message: authSucceededMsg,
                    token: token
                });
            }
            res.status(Status.Unauthorized).json({
                message: authFailedMsg
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(Status.ServerError).json({
                error: err
        });
    });
}

exports.users_delete_user_by_email = (req, res, next) => {
    const userEmail = req.params.email;
    User.findOneAndRemove({email: userEmail})
        .exec()
        .then(result => {
            console.log(result);
            res.status(Status.Success).json({
                message: `User ${userEmail} deleted from system`
            });
        })
        .catch(err => {
            console.log(err);
            res.status(Status.ServerError).json({
                error: err
            });
        });

}
