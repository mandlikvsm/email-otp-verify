import { User } from "../models/User.js";
import { UserVerification } from "../models/UserVerification.js";
import bcrypt from 'bcrypt';
import { PasswordReset } from "../models/PasswordReset.js";

import { sendVerificationEmail, sendResetEmail } from "../middlewares/emailAuth.js";




// transporterCheck();


export const signUp = (req, res) => {

    let { name, email, password, dob, verified } = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    dob = dob.trim();

    if (name == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields..!"
        });


    } else if (!/^[a-zA-Z ]*/.test(name)) {

        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })

    } else if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)) {

        res.json({
            status: "FAILED",
            message: "Invalid email entered"
        })

    } else if (!new Date(dob).getTime()) {
        res.json({
            status: "FAILED",
            message: "Invalid date of birth entered"
        })
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password is too short!"
        })
    } else {
        // checking if user already exists
        User.find({ email }).then(result => {
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "User with the provided email already exists"
                })
            } else {
                //try to create new user

                //password handling

                const saltRounds = 10;
                bcrypt
                    .hash(password, saltRounds)
                    .then(hashedPassword => {

                        const newUser = new User({
                            name,
                            email,
                            password: hashedPassword,
                            dob,
                            verified: false,

                        });

                        newUser
                            .save()
                            .then((result) => {
                                //handle account verification
                                sendVerificationEmail(result, res);


                                // res.json({
                                    // status: "SUCCESS",
                                //     message: "Signup successful...!",
                                //     data: result,
                                //     })

                                 })
                            .catch(err => {
                                console.log(err);

                                res.json({
                                    status: "FAILED",
                                    message: "An error occurred while saving user account!"
                                })

                            })

                    }).catch(err => {
                        console.log(err);

                        res.json({
                            status: "FAILED",
                            message: "An error occurred while hashing password!"
                        })

                    })
            }

        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user!"
            })
        })

    }

}



export const signIn = (req, res) => {

    let { email, password } = req.body;

    email = email.trim();
    password = password.trim();


    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials supplies..!"
        });


    } else {
        // checking if user already exists
        User.find({ email })
            .then(data => {
                if (data.length) {
                    // User exists


                    //check if user is verified already

                    if (!data[0].verified) {

                        res.json({
                            status: "FAILED",
                            message: "Email hasn't been verified yet. Check your inbox",
                        });
                    } else {


                        const hashedPassword = data[0].password;
                        bcrypt.compare(password, hashedPassword).then(result => {
                            if (result) {

                                //password match

                                res.json({
                                    status: "SUCCESS",
                                    message: "Signin successful",
                                    data: data
                                })
                            } else {
                                res.json({
                                    status: "FAILED",
                                    message: "Invalid password entered"
                                })
                            }
                        }).catch(err => {

                            res.json({
                                status: "FAILED",
                                message: "An error occured while comparing password.!"
                            });

                        });


                    }


                } else {

                    res.json({
                        status: "FAILED",
                        message: "Invalid credentials entered..!"
                    });

                }

            }).catch(err => {

                res.json({
                    status: "FAILED",
                    message: "An error occured while checking for existing user..!"
                });

            })
    }
}


export const verifyEmail = (req, res) => {

    let { userId, uniqueString } = req.params;
    UserVerification.find({ userId })
        .then((result) => {
            if (result.length > 0) {
                // user verification record exists so we proceed
                const { expiresAt } = result[0];
                const hashedUniqueString = result[0].uniqueString;


                //checking for expired unique string
                if (expiresAt < Date.now()) {
                    // record has expired so we delete it
                    UserVerification
                        .deleteOne({ userId })
                        .then(result => {
                            User.deleteOne({ _id: userId })
                                .then(() => {
                                    let message = "Link has expired. please sign up again.";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                                .catch((error) => {
                                    console.log(error);
                                    let message = "Clearing user with expired unique string failed.";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                });

                        })

                        .catch((error) => {
                            console.log(error);
                            let message = "An error occured while clearing expired user verification record.";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })

                } else {
                    // valid record exists so we validate the user string
                    // first compare the hashed unique string
                    bcrypt
                        .compare(uniqueString, hashedUniqueString)
                        .then(result => {
                            if (result) {
                                // string match
                                User
                                    .updateOne({ _id: userId }, { verified: true })
                                    .then(() => {
                                        UserVerification.deleteOne({ userId })
                                            .then(() => {
                                                res.send(`<h1>user verified successfully...! </h1>`);
                                            })
                                            .catch(error => {
                                                console.log(error);
                                                let message = "An error occured while finalizing successful verification.";
                                                res.redirect(`/user/verified/error=true&message=${message}`);
                                            })


                                    })
                                    .catch(error => {
                                        console.log(error);
                                        let message = "An error occured while updating user record to show verified.";
                                        res.redirect(`/user/verified/error=true&message=${message}`);
                                    })


                            }
                            else {
                                // existing record but incorrect verification details passed.
                                let message = "Invalid verification details passed. Check your inbox";
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            }

                        })
                        .catch(error => {

                            let message = "An error occured while comparing unique string.";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                }

            } else {
                // user verification record doesn't exist

                let message = "Account record doesn't exist or has been verified already. Please sign up or log in.";
                res.redirect(`/user/verified/error=true&message=${message}`);
            }
        })
        .catch((error) => {
            console.log(error);
            let message = "An error occured while checking for existing user verification records";
            res.redirect(`/user/verified/error=true&message=${message}`);

        })

}

export const userVerified = (req, res) => {

    res.send(`<h1>User Verified Successfully.....!`);

}



export const requestPasswordReset = (req, res) => {
    const { email, redirectUrl } = req.body;
    

    // check if email exist
    User.find({ email })
        .then((data) => {
            if (data.length) {
                // user exists


                //checking if user is verified

                if (!data[0].verified) {
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox!",
                    })
                } else {
                    // procees with email to reset password
                    sendResetEmail(data[0], redirectUrl, res);
                }
                
            } else {
                res.json({
                    status: "FAILED",
                    message: "No account with the supplied email address!",
                })
            }
        })
        .catch(error => {
            console.log(error);
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user",
            })
    })

}




export const resetPassword = (req,res) => {
    let { userId, resetString, newPassword } = req.body;
    PasswordReset.find({ userId })
        .then(result => {
            if (result.length > 0) {
                // password reset record exists so we procees
                const { expiresAt } = result[0];
                const hashedResetString = result[0].resetString;
                console.log(hashedResetString);
                
                //checking for expired reset string
                if (expiresAt < Date.now()) {
                    
             
                    PasswordReset.deleteOne({ userId })
                        .then(() => {
                            // reset record deleted successfully
                            res.json({
                                status: "FAILED",
                                message: "Password reset link has expired.",
                            })
                        })
                            
                        
                        .catch(error => {
                             // deletion failed
                             console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Clearing password reset record failed",
                            });
                        })
                    
                } else {
                    
                    // valid reset record exists so we validate the reset string
                    // first compare the hashed reset string

                    bcrypt
                        .compare(resetString, hashedResetString)
                        .then((result) => {
                            if (result) {
                                // strings matched
                                //hash password again
                                const saltRounds = 10;
                                bcrypt
                                    .hash(newPassword, saltRounds)
                                    .then(hashedNewPassword => {
                                        //update user password

                                        User
                                            .updateOne({ _id: userId }, { password: hashedNewPassword })
                                            .then(() => {
                                                //update complete. Now delete reset record
                                                PasswordReset.deleteOne({ userId })
                                                    .then(() => {
                                                        //both user record and reset record updated

                                                        res.json({
                                                            status: "SUCCESS",
                                                            message:"Password has been reset successfully.",
                                                        })

                                                    })
                                                    .catch(error => {
                                                        console.log(error);
        
                                                        res.json({
                                                            status: "FAILED",
                                                            message:"An error occured while finalizing password reset.",
                                                        })
                                                    
                                                })

                                            })
                                            .catch(error => {
                                                console.log(error);

                                                res.json({
                                                    status: "FAILED",
                                                    message:"Updating user password failed.",
                                                })
                                            
                                        })
                                    })
                                    .catch(error => {
                                        console.log(error);

                                        res.json({
                                            status: "FAILED",
                                            message:"An error occured while hashing new password.",
                                        })
                                })
                        
                            } else {
                                // Existing record but incorrect reset string passed
                                res.json({
                                    status: "FAILED",
                                    message: "Invalid password reset details passed.",
                                })
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Comparing password reset strings failed.",
                            })
                    })

                }
                    
                
            } else {
                // password reset record doesn't exist
                res.json({
                    status: "FAILED",
                    message: "Password reset request not found.",
                })
            }
        })
        .catch(error => {
            console.log(error);

            res.json({
                status: "FAILED",
                message: "Checking for existing password reset record failed.",
                
            })
    })
}