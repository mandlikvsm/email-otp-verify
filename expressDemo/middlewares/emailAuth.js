import dotenv from 'dotenv';
dotenv.config({ debug: true });
import { v4 as uuidv4 } from 'uuid';
// uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
import bcrypt from 'bcrypt';
import  {User}  from '../models/User.js';
import  {UserVerification}  from '../models/UserVerification.js';
import  {createTransport}  from 'nodemailer';
import { PasswordReset } from '../models/PasswordReset.js';

// export const transporterCheck = () => {

    
// }


export const sendVerificationEmail = ({ _id, email }, res) => {

    let transporter = createTransport({

        service: "gmail",
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD,
        },
    });
    



    // url to be used in the email

    const currentUrl = "http://localhost:4000/"

    const uniqueString = uuidv4() + _id;

    const mailOption = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Please Verify Your Email",
        html: `<p> Verify your email address to complete the signup and login into your account.</p>
                <p>This link <b>expires on 6 hours</b>.</p>
                <p>Press
                <a href=${currentUrl + 'user/verify/' + _id + '/' + uniqueString} >here </a>
                to proceed. </p>`,
        

    };

    // hash the uniqueString

    const saltRounds = 10;
    bcrypt.hash(uniqueString, saltRounds)
        .then((hashedUniqueString) => {
            // set values in userVerification collection

            const newVerification = new UserVerification({
                userId: _id,
                uniqueString: hashedUniqueString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 21600000,
                
            });
            newVerification.save()
                .then(() => {
                    transporter.sendMail(mailOption)
                        .then(() => {
                            //email sent and verification record saved
                            res.json({
                                status: "PENDING",
                                message: "Verification email sent..!"
                            })    
                            


                        })
                        .catch((error) => {
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: " verification email failed!",
                            })
                        });
                })
                .catch((error) => {
                    console.log(error);
                    res.json({
                        status: "FAILED",
                        message: "Can't save verification email data!",
                    })
                });
        })
        .catch(() => {
            
            res.json({
                status: "FAILED",
                message: "An error occured while hashing email data!",
            });
        });

};


export const sendResetEmail = ({ _id, email }, redirectUrl, res) => {
    let transporter = createTransport({

        service: "gmail",
        auth: {
            user: process.env.AUTH_EMAIL,
            pass: process.env.AUTH_PASSWORD,
        },
    });
    


    const resetString = uuidv4() + _id;

    // First, we clear all existing reset records

    PasswordReset
        .deleteMany({ userId: _id })
        .then(result => {
            //Reset records deleted successfully
            //Now we send the email
            const mailOption = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Reset your password",
                html: `<p>We heard that you lost the password.</p>
                 <p>Don't worry, use the link below to reset it.</p>

                <p>This link <b>expires on 60 minutes</b>.</p>
                <p>Press
                <a href=${redirectUrl + '/' + _id + '/' + resetString} >here </a>
                to proceed. </p>`,
        

            };
            // hash the reset string

            
            const saltRounds = 10;
            bcrypt
                .hash(resetString, saltRounds)
                .then((hashedResetString) => {
                    // set values in password collection
        
                    const NewPasswordReset = new PasswordReset({
                        userId: _id,
                        resetString: hashedResetString,
                        createdAt: Date.now(),
                        expiresAt: Date.now() + 3600000,
                        
                    });

                    NewPasswordReset
                        .save()
                        .then(() => {
                            transporter.sendMail(mailOption)
                                .then(() => {
                                    // reset email sent and password reset record saved
                                    res.json({
                                        status: "PENDING",
                                        message: "Password reset email sent..!"
                                    })    
                                })
                                .catch(error => {
                                    console.log(error);
                    
                                    res.json({
                                        status: "FAILED",
                                        message: "Password reset email failed!",
                                    });
                                })
                        })
                        .catch(error => {
                            console.log(error);
            
                            res.json({
                                status: "FAILED",
                                message: "Counldn't save  password reset data!",
                            });
                        })

                })
                        
                        .catch((error) => {
                            console.log(error);
            
                            res.json({
                                status: "FAILED",
                                message: "An error occured while hashing password reset data!",
                            });
                        });

                })

                .catch(error => {
                    //error while clearing existing records
                    console.log(error);
                    res.json({
                        status: "FAILED",
                        message: "Clearing existing password reset records failed!",
                    });
                })
    
        
}
