import mongoose from "mongoose";

export type User = {
    name: string;
    email: string;
    password?: string;
    avatar?: string;
    role: mongoose.Types.ObjectId | string;
    tokenVersion?: number;
    createdAt?: Date;
    updatedAt?: Date;
};