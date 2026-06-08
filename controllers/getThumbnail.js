import thumbnailModel from "../models/thumbnailModel.js";


export const getThumbnails = async (req, res) => {
  try {
     const userid =req.userId
    const thumbnails = await thumbnailModel.find({ userId:userid })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      thumbnails,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch thumbnails" });
  }
};