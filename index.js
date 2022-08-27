import express from "express";
import { Auth, LoginCredentials } from "two-step-auth";

const app = express();

app.get("/", (req,res) => {
    res.send(`welcome to home`);
});

const port = 4000;


async function login(emailId) {
    
try {
    const res = await Auth(emailId, "Google");
    console.log(res);
    console.log(res.mail);
    console.log(res.OTP);
    console.log(res.success);

} catch (error) {
    console.log(error)
    
}

}

LoginCredentials.mailID = "suyashmundhe1133@gmail.com";
LoginCredentials.password = "vsm123";
LoginCredentials.use = true;

login("suyashmundhe1133@gmail.com");




























app.listen(port, () => {
    console.log(`server is running on port: ${port}`);

});