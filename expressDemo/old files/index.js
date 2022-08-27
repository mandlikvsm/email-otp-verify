const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');



const router = require('./userRoutes');

mongoose.connect("mongodb+srv://vsm123:vsm123@tutorial.qxaq1cv.mongodb.net/test").then(() => {
    console.log(`connected to mongoDB successfully.....!`)
}).catch((error) => {
    console.log(error);
});


const employee = new  mongoose.Schema({

    name: String,
    id: Number,
    city: String,
    companyName: String,
    workout:Boolean

})

const Employee = mongoose.model("emplyoee", employee);

const adder = async() => {
    
    // const ee = new Employee({
    //     name: "Vishal",
    //     workout: true,
    //     city: "Pune",
    //     companyName:"Bitwise"
    // })
    // await ee.save();

    const ee = await Employee.find({name:{$eq:"Vishal"}});
    
    console.log(ee);
    
    
}

adder();





// const router = require


const app = express();
app.use(bodyparser.urlencoded({ extended: false }));

app.use(router);

app.use(express.json());




const port = 4000;

app.get("/", (req, res) => {
    console.log(path.join(__dirname + "/index.html"));
    res.sendFile(path.join(__dirname+ "/index.html"));


});


// app.get("/api/v1/userdata", (req, res) => {
//     // console.log(req.body);
//     // res.send(`${req.body.name}`);
//     res.json({
//         name: "Vishal",
//         email: "vsm@gmail.com",
//         password:"vsm123"
//     })


// });

app.post("/api/v1/register", (req,res) => {

    const userName = req.body.name;
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    res.json({
        success: true,
        name: userName,
        email: userEmail,
        password: userPassword,
        

    });
})


// app.get("/about", (req, res) => {
//     res.send("<h1>Hello world with about </h1>");


// });app.get("/home", (req, res) => {
//     res.send("<h1>Hello world with home </h1>");


// });
// app.get("/demo", (req, res) => {
//     res.send("<h1>Hello world with demo </h1>");


// });app.get("/login", (req, res) => {
//     res.send("<h1>Hello world with login </h1>");


// });

app.listen(port, () => {
    console.log(`server is running on port: ${port}`);

});