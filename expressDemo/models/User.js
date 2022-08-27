import mongoose  from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    dob: Date,
    verified:Boolean
});

export const User = mongoose.model('User', UserSchema);

