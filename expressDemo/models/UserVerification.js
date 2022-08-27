import mongoose  from 'mongoose';

const UserVerificationSchema = new mongoose.Schema({
    userId: String,
    uniqueString: String,
    createdAt: Date,
    expiresAt: Date

});

export const UserVerification = mongoose.model('UserVerification', UserVerificationSchema);

