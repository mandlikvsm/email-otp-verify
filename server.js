import  Express  from "express";
import  Dotenv  from "dotenv";
import bodyParser from "body-parser";
import nodemailer from 'nodemailer';

const app = Express();

Dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 5000;

app.get('/', (req, res) => {
    res.send(`Welcome`);
})

// simple approach

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass:process.env.AUTH_PASSWORD
    }
})


// auth approach
const transporterAuth = nodemailer.createTransport({
    service: "gmail",

    auth: {
        type: "OAUTH2",
        user: process.env.AUTH_EMAIL,
        clientId: process.env.AUTH_CLIENT_ID,
        clientSecret: process.env.AUTH_CLIENT_SECRET,
        refreshToken:process.env.AUTH_REFRESH_TOKEN
    }
})



transporterAuth.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Ready for message");
        console.log(success);
    }
});

app.post('/sendmail', (req, res) => {
    const { to, subject, message } = req.body;

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: to,
        subject: subject,
        text: message
    }
    transporterAuth.sendMail(mailOptions)
        .then(() => {
            res.json({
                status: "SUCCESS",
                message: "message sent successfully"
            });
         })
        .catch((error) => {
            console.log(error);
            res.json({
                status: "FAILED",
                message: "An error occurred"
            });
    })
})

app.listen(port, () => {
    console.log(`server is running on ${port}`);
})

