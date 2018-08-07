const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");

router.get("/", (req, res, next) => {
    User.find()
        .select("id email")
        .exec()
        .then(users => {
            console.log(users);
            res.status(200).json(users);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post("/signup", (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            // Because returned user object is an array need
            // to check is empty as even empty array is truthy
            if(user.length >= 1){
                res.status(422).json({
                    message: `User ${req.body.email} already exists in the system.`
                });
            } else {
                // Attempt to hash password first and if succeed
                // save hash of password to database
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err){
                        console.log(err);
                        return res.status(500).json({
                            error: err
                        })
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
                                res.status(201).json({
                                    message: `Created user ${result.email}`
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                        }
                    })
                }
        });
});

router.delete("/:userId", (req, res, next) => {
    const id = req.params.userId;
    User.remove({_id: id})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: `User ${id} deleted from system`
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

module.exports = router;
