import express from "express";
import GenerateThumbnail from "../controllers/thumbnailController.js";
import userAuth from "../middleware/userAuth.js";
import { getThumbnails } from "../controllers/getThumbnail.js";
import { deleteThumbnail } from "../controllers/deleteThumbnail.js";

const router = express.Router();

router.post("/generate",userAuth,GenerateThumbnail);
router.get("/thumbnails",userAuth,getThumbnails);
router.delete("/thumbnails/:id",userAuth, deleteThumbnail);

export default router;
