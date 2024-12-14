"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcrypt');
const userModel_1 = require("../models/userModel");
const securePassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passwordHash = yield bcrypt.hash(password, 10);
        return passwordHash;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        else {
            console.error("Unknown error:", error);
        }
    }
});
const loadRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render('registration');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        else {
            console.error("Unknown error:", error);
        }
    }
});
const insertUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).send("File is required");
            return;
        }
        const spassword = yield securePassword(req.body.password);
        const user = new userModel_1.User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
            password: spassword,
            is_admin: 0,
        });
        const userData = yield user.save();
        if (userData) {
            res.render('registration', { message: "Your registration has been successfull." });
        }
        else {
            res.render('registration', { message: "Your registration has been failed." });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        else {
            console.error("Unknown error:", error);
        }
    }
});
const loginLoad = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render('login');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        else {
            console.error("Unknown error:", error);
        }
    }
});
const verifyLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(`Login attempt for email: ${email}`);
        // Fetch user data and ensure it's typed correctly
        const userData = yield userModel_1.User.findOne({ email }).lean();
        if (userData) {
            console.log("User found:", userData);
            // Compare the password with the hashed password in the database
            const passwordMatch = yield bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                console.log("Password match");
                // Temporarily bypass email verification for testing
                if (userData.is_varified === 0) {
                    console.log("Email verification bypassed for testing");
                    req.session.user_id = userData._id.toString();
                    res.redirect('/home');
                }
                else {
                    console.log("Email verified, logging in");
                    req.session.user_id = userData._id.toString();
                    res.redirect('/home');
                }
            }
            else {
                console.log("Incorrect password");
                res.render('login', { message: "Incorrect Email or Password." });
            }
        }
        else {
            console.log("User not found");
            res.render('login', { message: "Incorrect Email or Password." });
        }
    }
    catch (error) {
        console.error("Error during login:", error instanceof Error ? error.message : "Unknown error");
        res.status(500).send("Server Error");
    }
});
const loadHome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.session.user_id; // Access user_id from the session
        if (!userId) {
            return res.redirect('/login');
        }
        const userData = yield userModel_1.User.findById({ _id: userId });
        res.render('home', { user: userData });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error("Unknown error:", error);
        }
    }
});
const userLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                res.status(500).send("Failed to logout.");
            }
            else {
                res.redirect('/');
            }
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Unexpected error during logout:", error.message);
        }
        else {
            console.error("Unknown error during logout:", error);
        }
    }
});
const editLoad = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.query.id;
        const userData = yield userModel_1.User.findById({ _id: id });
        if (userData) {
            res.render('edit', { user: userData });
        }
        else {
            res.redirect('/home');
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        else {
            console.error("Unknown error:", error);
        }
    }
});
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let updateData = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno
        };
        if (req.file) {
            updateData.image = req.file.filename;
        }
        const userData = yield userModel_1.User.findByIdAndUpdate(req.body.user_id, { $set: updateData });
        res.redirect('/home');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        else {
            console.error("Unknown error:", error);
        }
    }
});
module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    editLoad,
    updateProfile
};
