import mongoose, {Document, Schema} from "mongoose";


export interface IUser extends Document {
    username: string;
    email: string;
}


const schema: Schema<IUser> = new Schema({
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
}, {timestamps: true});


const User = mongoose.model<IUser>('User', schema);


export default User;