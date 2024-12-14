import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, IUser } from '../models/userModel'; // Correct import

// Load login page
const loadLogin = (req: Request, res: Response): void => {
    res.render('login');
};

// Verify login credentials
const verifyLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email }) as IUser | null;

        if (userData && await bcrypt.compare(password, userData.password)) {
            if (userData.is_admin === 0) {
                res.render('login', { message: "Email or Password is incorrect" });
            } else {
                req.session.user_id = userData._id.toString(); // TypeScript will infer the type correctly now
                res.redirect('/admin/home');
            }
        } else {
         res.render('login', { message: "Email or Password is incorrect" });
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
    }
};

// Load dashboard page for admin
const loadDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const userData = await User.findById(req.session.user_id) as IUser | null;
        if (userData) {
            res.render('home', { admin: userData });
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
    }
};

// Logout the user (destroy session)
const logout = (req: Request, res: Response): void => {
    req.session.destroy(() => {
        res.redirect('/admin');
    });
};

// Admin dashboard to manage users
const adminDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const searchQuery = req.query.search || ''; // Get search term from query string
        const usersData = await User.find({
            is_admin: 0,
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
                { mobile: { $regex: searchQuery, $options: 'i' } }
            ]
        }) as IUser[];

        res.render('dashboard', { users: usersData, searchQuery });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
};

// Load new user creation page
const newUserLoad = (req: Request, res: Response): void => {
    res.render('new-user');
};

// Add new user
const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, mno, password } = req.body;
        const image = req.file?.filename; // Ensure image is available
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            mobile: mno,
            image,
            password: hashedPassword,
            is_admin: 0,
        });

        await user.save();
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
        res.render('new-user', { message: "Something went wrong...!" });
    }
};

// Load edit user page
const editUserLoad = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id) as IUser | null;
        if (user) {
            res.render('edit-user', { user });
        } else {
            res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
        res.redirect('/admin/dashboard');
    }
};

// Update user details
const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, mno, password } = req.body;
        const updateData: { [key: string]: any } = { name, email, mobile: mno };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await User.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
        res.redirect('/admin/dashboard');
    }
};

// Delete a user
const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.query.id as string;
        await User.deleteOne({ _id: id });
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error instanceof Error ? error.message : 'Unknown error');
    }
};

export {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUser,
    deleteUser
};
