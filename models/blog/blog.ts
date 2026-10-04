import { model, models, Schema } from "mongoose";


const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    tags: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Tag',
            required: true,
        }
    ],
    coverImage: {
        type: String,
        default: '',
        trim: true,
    },
    views: {
        type: Number,
        default: 0,
        min: 0,
    }
}, { timestamps: true });

export const Blog = models.Blog || model('Blog', blogSchema);