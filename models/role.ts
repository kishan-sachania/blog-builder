import { model, models, Schema } from "mongoose";

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,

  permissions: [{
    type: Schema.Types.ObjectId,
    ref: "Permission",
  }],
}, { timestamps: true });

export const Role = models.Role || model("Role", roleSchema);