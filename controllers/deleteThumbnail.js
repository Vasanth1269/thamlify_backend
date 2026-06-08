import thumbnailModel from "../models/thumbnailModel.js";

export const deleteThumbnail = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ 1. Find thumbnail first
    const thumbnail = await thumbnailModel.findById(id);

    if (!thumbnail) {
      return res.status(404).json({
        success: false,
        message: "Thumbnail not found",
      });
    }

    // ✅ 2. Check ownership (only if auth exists)
    if (thumbnail.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // ✅ 3. Delete
    await thumbnailModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Thumbnail deleted successfully",
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error while deleting thumbnail",
    });
  }
};