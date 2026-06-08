import mongoose from "mongoose";

const thumbnailSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    style: {
      type: String,
      enum: [
        "Bold & Graphic",
        "Tech/Futuristic",
        "Minimalist",
        "Photorealistic",
        "Illustrated",
      ],
      default: "Bold & Graphic",
    },
    aspect_ratio: {
      type: String,
      enum: ["16:9", "1:1", "9:16"],
      default: "16:9",
    },
    color_scheme: {
      type: String,
      enum: [
        "vibrant",
        "sunset",
        "forest",
        "neon",
        "purple",
        "monochrome",
        "ocean",
        "pastel",
      ],
    },
    text_overlay: { type: Boolean, default: false },
    image_url: { type: String, default: "" },
    prompt_used: { type: String },
    user_prompt: { type: String },
    isGenerating: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const thumbnailModel =
  mongoose.models.thumbnail ||
  mongoose.model("thumbnail", thumbnailSchema);

export default thumbnailModel;
