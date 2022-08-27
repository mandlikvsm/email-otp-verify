import  Express  from "express";
import bodyParser from "body-parser";
import speakeasy from 'speakeasy';

const app = Express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
    console.log(`server started...`)
})

app.get('/', (req, res) => {
    res.send("200");
})


app.get('/home', (req, res) => {
    res.status(200).send("home")
});


app.get("/temp", (req, res) => {
    res.send({
        id: 1,
        name: "Vishal",
    });
});

// console.log(__dirname());



// app.post("/totp-secret", (req, res, next) => {
    
//     var secret = speakeasy.generateSecret({ length: 20 });
//     res.send({ "secret": secret.base32 });

// });

// app.post("/totp-generate", (req, res, next) => {
//     res.send({
//         "token": speakeasy.totp({
//             secret: req.body.secret,
//             encoding: "base32"
//         }),
//         "remaining": (30 - Math.floor((new Date().getTime() / 1000.0 % 30)))
//     })
// })

// app.post("/totp-validate", (req, res, next) => {
//     res.send({
//         "valid": speakeasy.totp.verify({
//             secret: req.body.secret,
//             encoding: "base32",
//             token: req.body.token,
//             window: 0
//         })
//         // "validate": true
//     });
// })