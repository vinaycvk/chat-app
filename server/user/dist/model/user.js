import mongoose, { Document, Schema } from "mongoose";
const schema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
}, { timestamps: true });
const User = mongoose.model('User', schema);
export default User;
//# sourceMappingURL=user.js.map