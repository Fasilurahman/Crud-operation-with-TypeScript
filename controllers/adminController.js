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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.editUserLoad = exports.addUser = exports.newUserLoad = exports.adminDashboard = exports.logout = exports.loadDashboard = exports.verifyLogin = exports.loadLogin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userModel_1 = require("../models/userModel"); // Correct import
// Load login page
const loadLogin = (req, res) => {
    res.render('login');
};
exports.loadLogin = loadLogin;
// Verify login credentials
const verifyLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const userData = yield userModel_1.User.findOne({ email });
        if (userData && (yield bcrypt_1.default.compare(password, userData.password))) {
            if (userData.is_admin === 0) {
                res.render('login', { message: "Email or Password is incorrect" });
            }
            else {
                req.session.user_id = userData._id.toString(); // TypeScript will infer the type correctly now
                res.redirect('/admin/home');
            }
        }
        else {
            res.render('login', { message: "Email or Password is incorrect" });
        }
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
    }
});
exports.verifyLogin = verifyLogin;
// Load dashboard page for admin
const loadDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield userModel_1.User.findById(req.session.user_id);
        if (userData) {
            res.render('home', { admin: userData });
        }
        else {
            res.redirect('/admin');
        }
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
    }
});
exports.loadDashboard = loadDashboard;
// Logout the user (destroy session)
const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin');
    });
};
exports.logout = logout;
// Admin dashboard to manage users
const adminDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = req.query.search || ''; // Get search term from query string
        const usersData = yield userModel_1.User.find({
            is_admin: 0,
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
                { mobile: { $regex: searchQuery, $options: 'i' } }
            ]
        });
        res.render('dashboard', { users: usersData, searchQuery });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
});
exports.adminDashboard = adminDashboard;
// Load new user creation page
const newUserLoad = (req, res) => {
    res.render('new-user');
};
exports.newUserLoad = newUserLoad;
// Add new user
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, email, mno, password } = req.body;
        const image = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename; // Ensure image is available
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = new userModel_1.User({
            name,
            email,
            mobile: mno,
            image,
            password: hashedPassword,
            is_admin: 0,
        });
        yield user.save();
        res.redirect('/admin/dashboard');
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
        res.render('new-user', { message: "Something went wrong...!" });
    }
});
exports.addUser = addUser;
// Load edit user page
const editUserLoad = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.User.findById(req.params.id);
        if (user) {
            res.render('edit-user', { user });
        }
        else {
            res.redirect('/admin/dashboard');
        }
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
        res.redirect('/admin/dashboard');
    }
});
exports.editUserLoad = editUserLoad;
// Update user details
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, mno, password } = req.body;
        const updateData = { name, email, mobile: mno };
        if (req.file) {
            updateData.image = req.file.filename;
        }
        if (password) {
            updateData.password = yield bcrypt_1.default.hash(password, 10);
        }
        yield userModel_1.User.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/dashboard');
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
        res.redirect('/admin/dashboard');
    }
});
exports.updateUser = updateUser;
// Delete a user
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.query.id;
        yield userModel_1.User.deleteOne({ _id: id });
        res.redirect('/admin/dashboard');
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
    }
});
exports.deleteUser = deleteUser;
