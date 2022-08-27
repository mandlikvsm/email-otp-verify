import mongoose from "mongoose";



export const dbconnect = () => {

    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true})
    .then(() => {
        console.log(`Database connected successfully...`);
    }).catch((err) => console.log(err));
             
}