import express from "express";
import bodyParser from "body-parser";
import { dbconnect } from './config/db.js'
import dotenv from 'dotenv';
import { userRouter } from "./api/User.js";
dotenv.config({debug:true});

export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/user', userRouter);



dbconnect();
const port = 4000;

app.get("/", (req,res) => {
    res.send(`<h1>Hello welcome to Email OTP Verificaton</h1>`);
})

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})