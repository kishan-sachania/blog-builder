    import { model, models, Schema } from "mongoose";

    const permissionSchema = new Schema({
        name: {
            type: String,
            required: true,
            unique: true,
        },

        resource: {
            type: String,
            required: true,
        },

        action: {
            type: String,
            enum: ["create", "read", "update", "delete"],
            required: true,
        },
    }, { timestamps: true });

    permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

    export const Permission = models.Permission || model("Permission", permissionSchema);

