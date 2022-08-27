import  Router  from "express";
import  {signIn, signUp, userVerified, verifyEmail, resetPassword, requestPasswordReset}  from "../Controllers/User.js";
import  {createTransport}  from 'nodemailer';

export const userRouter = Router();




// userRouter.post('/signUp', (req, res) => {
    
// });
let transporter = createTransport({

    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);

    } else {
        console.log(`Ready for message`);
        console.log(success);
    }
})


userRouter.route('/signup').post(signUp);
userRouter.route('/signin').post(signIn);

userRouter.route('/verify/:userId/:uniqueString').get(verifyEmail);

userRouter.route('/verified').get(userVerified);
userRouter.route('/requestPasswordReset').post(requestPasswordReset);

userRouter.route('/resetPassword').post(resetPassword);


