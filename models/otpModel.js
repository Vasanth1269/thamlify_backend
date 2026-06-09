import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const otpModel = mongoose.model("Otp", otpSchema);

export default otpModel;