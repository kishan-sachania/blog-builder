import { model, models, Schema } from 'mongoose';

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'in_review', 'published', 'rejected', 'archived'],
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
      },
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
    },
    editorialNotes: {
      type: String,
      default: '',
      trim: true,
    },
    submittedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ category: 1, status: 1 });

export const Blog = models.Blog || model('Blog', blogSchema);
