

const registerUser = (req, res) => {

    console.log(req.body);
    
    const userName = req.body.name;
    const userEmail = req.body.email;
    const userPassword = req.body.password;

    res.json({
        success: true,
        name: userName,
        email: userEmail,
        password: userPassword,
        

    });

};

module.exports = registerUser;