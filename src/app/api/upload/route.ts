import { v2 as cloudinary } from "cloudinary";
import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return ApiResponse.error(401, false, "Unauthorized: Please log in to upload images", null);
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return ApiResponse.error(
        500,
        false,
        "Media storage service is not configured. Please check environment variables.",
        null
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return ApiResponse.error(400, false, "No image file provided in request", null);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return ApiResponse.error(400, false, "Only image files are permitted", null);
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary via stream
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "blog_builder",
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload failed"));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        }
      );

      uploadStream.end(buffer);
    });

    return ApiResponse.success(200, true, "Image uploaded successfully", uploadResult);
  } catch (error: any) {
    return ApiResponse.error(500, false, error.message || "Failed to upload image", null);
  }
}
