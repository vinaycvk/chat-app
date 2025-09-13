import mongoose, { Document, Schema, Types } from "mongoose";



export interface IMessage extends Document {
    chatId: Types.ObjectId;
    sender: string;
    text?: string;
    image?: {
        url: string;
        public_id: string;
    };
    messageType: "text" | "image";
    seen: boolean;
    seenAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}


const schema = new Schema<IMessage>(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true
        },
        sender: { type: String, required: true },
        text: { type: String },
        image: {
            url: String,
            public_id: String,
        },
        messageType: {
            type: String, enum: ["text", "image"],
            default: "text"
        },
        seen: { type: Boolean, default: false },
        seenAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);


export const Message = mongoose.model<IMessage>("Message", schema);