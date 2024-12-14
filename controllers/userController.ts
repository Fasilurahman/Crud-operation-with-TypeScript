
const bcrypt = require('bcrypt');
import { Request, Response } from 'express';
import { Session } from 'express-session'; 
import { User, IUser } from "../models/userModel"; 
import { log } from 'console';





const securePassword = async(password:string): Promise<string | undefined>=>{
    try{
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        } else {
            console.error("Unknown error:", error);
        }
    }
}

const loadRegister = async (req:Request, res:Response): Promise<void> => {
    try {
        res.render('registration');
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        } else {
            console.error("Unknown error:", error);
        }
    }
};

const insertUser = async (req:Request, res:Response): Promise<void> => {
    try {

        if (!req.file) {
            res.status(400).send("File is required");
            return;
        }
        const spassword = await securePassword(req.body.password);
        
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno,
            image: req.file.filename,
            password: spassword,
            is_admin: 0,
        });

        const userData = await user.save();

        if (userData) {
            res.render('registration',{message:"Your registration has been successfull."});
        }else{
            res.render('registration',{message:"Your registration has been failed."});
        }

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        } else {
            console.error("Unknown error:", error);
        }
    }
};

const loginLoad = async(req: Request, res: Response): Promise<void>=>{
    try{
        res.render('login');
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        } else {
            console.error("Unknown error:", error);
        }
    }
}

const verifyLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        console.log(`Login attempt for email: ${email}`);

        // Fetch user data and ensure it's typed correctly
        const userData = await User.findOne({ email }).lean() as IUser | null;

        if (userData) {
            console.log("User found:", userData);

            // Compare the password with the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                console.log("Password match");
            
                // Temporarily bypass email verification for testing
                if (userData.is_varified === 0) {
                    console.log("Email verification bypassed for testing");
                    req.session.user_id = userData._id.toString();
                    res.redirect('/home');
                } else {
                    console.log("Email verified, logging in");
                    req.session.user_id = userData._id.toString();
                    res.redirect('/home');
                }
            }
            
             else {
                console.log("Incorrect password");
                res.render('login', { message: "Incorrect Email or Password." });
            }
        } else {
            console.log("User not found");
            res.render('login', { message: "Incorrect Email or Password." });
        }
    } catch (error) {
        console.error("Error during login:", error instanceof Error ? error.message : "Unknown error");
        res.status(500).send("Server Error");
    }
};



const loadHome = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.session.user_id; // Access user_id from the session
        if (!userId) {
            return res.redirect('/login');
        }

        const userData = await User.findById({ _id: userId });
        res.render('home', { user: userData });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error("Unknown error:", error);
        }
    }
};


const userLogout = async (req: Request, res: Response): Promise<void> => {
    try {
        req.session.destroy((err: any) => {
            if (err) {
                console.error("Error destroying session:", err);
                res.status(500).send("Failed to logout.");
            } else {
                res.redirect('/');
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Unexpected error during logout:", error.message);
        } else {
            console.error("Unknown error during logout:", error);
        }
    }
};


const editLoad = async (req: Request, res: Response): Promise<void>=>{
    try {
        const id = req.query.id as string;
        const userData = await User.findById({_id:id});
        if(userData){
            res.render('edit',{user:userData})
        }else{
            res.redirect('/home');
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        } else {
            console.error("Unknown error:", error);
        }
    }
}

const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        let updateData: Record<string, any> = {
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mno
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const userData = await User.findByIdAndUpdate(req.body.user_id, { $set: updateData });

        res.redirect('/home');
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        } else {
            console.error("Unknown error:", error);
        }
    }
}


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
