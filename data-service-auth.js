const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    userName: {
        type: String,
        unique: true,
    },
    password: String,
    email: String,
    loginHistory: [
        {
            dateTime: Date,
            userAgent: String,
        },
    ],
});

let User;
var url =
    "mongodb+srv://dbUser:ykim296@senecaweb.0we8zqy.mongodb.net/?retryWrites=true&w=majority";

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(url);
        db.on("error", (err) => {
            reject(err);
        });
        db.once("open", () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt
                .hash(userData.password, 10)
                .then((hash) => {
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser
                        .save()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (err.code === 11000) {
                                reject("User Name already taken");
                            } else {
                                reject(
                                    "There was an error creating the user: " +
                                        err
                                );
                            }
                        });
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    });
};

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then((users) => {
                if (!users) {
                    reject("Unable to find user:" + userData.userName);
                } else {
                    bcrypt
                        .compare(userData.password, users[0].password)
                        .then((result) => {
                            if (!result) {
                                reject(
                                    "Incorrect Password for user: " +
                                        userData.userName
                                );
                            } else {
                                users[0].loginHistory.push({
                                    dateTime: new Date().toString(),
                                    userAgent: userData.userAgent,
                                });
                                User.updateOne(
                                    {
                                        userName: users[0].userName,
                                    },
                                    {
                                        $set: {
                                            loginHistory: users[0].loginHistory,
                                        },
                                    }
                                )
                                    .then(() => {
                                        console.log("update!");
                                        resolve(users[0]);
                                    })
                                    .catch((err) => {
                                        reject(
                                            "There was an error verifying the user: " +
                                                err
                                        );
                                    });
                            }
                        });
                }
            })
            .catch((err) => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};
