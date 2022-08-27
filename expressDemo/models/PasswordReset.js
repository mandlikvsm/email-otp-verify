import mongoose  from 'mongoose';

const PasswordResetSchema = new mongoose.Schema({
    userId: String,
    resetString: String,
    createdAt: Date,
    expiresAt: Date

});

export const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema);

