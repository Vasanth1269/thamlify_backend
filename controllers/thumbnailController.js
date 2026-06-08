import thumbnailModel from "../models/thumbnailModel.js";
import { v2 as cloudinary } from "cloudinary";
import {GoogleGenAI,Modality} from "@google/genai"



const GenerateThumbnail = async (req, res) => {
  try {
    const userId = req.userId;
    console.log( "fff",userId)
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      title,
      prompt: user_prompt,
      aspect_ratio = "16:9",
      color_scheme,
      text_overlay,
      style
    } = req.body;

    /* ---------- STYLE PROMPTS ---------- */
const stylePrompts = {
  "Bold & Graphic": `
  Eye-catching YouTube thumbnail with bold, oversized typography,
  vibrant and saturated colors, strong contrast, expressive facial
  emotions, dramatic lighting, sharp focus, dynamic composition,
  high energy visual style, attention-grabbing layout, professional
  YouTube design optimized for high click-through rate.
  `,

  "Tech/Futuristic": `
  Futuristic YouTube thumbnail with sleek modern design, digital
  interface elements, glowing neon accents, holographic effects,
  cyberpunk or sci-fi aesthetic, sharp lighting, cool color tones,
  high-tech atmosphere, clean yet powerful composition, professional
  tech-focused visual style.
  `,

  "Minimalist": `
  Minimalist YouTube thumbnail with clean layout, simple shapes,
  limited color palette, plenty of negative space, modern flat design,
  subtle shadows, clear focal point, elegant and uncluttered look,
  professional aesthetic focused on clarity and readability.
  `,

  "Photorealistic": `
  Photorealistic YouTube thumbnail with ultra-realistic lighting,
  natural skin tones, DSLR-style photography, shallow depth of field,
  cinematic composition, realistic textures, high detail, natural
  shadows, candid and authentic look, professional studio quality.
  `,

  "Illustrated": `
  Illustrated YouTube thumbnail featuring custom digital illustration,
  stylized characters, bold outlines, vibrant colors, creative cartoon
  or vector art style, expressive emotions, playful yet professional
  composition, clean illustration suitable for modern YouTube content.
  `
};


  const colorSchemeDescriptions = {
  vibrant: `
  Vibrant and energetic color palette with high saturation,
  bold contrasts, bright and lively tones, eye-catching colors
  designed to immediately grab attention and create a strong
  visual impact.
  `,

  sunset: `
  Warm sunset-inspired tones with shades of orange, pink,
  red, and purple, soft gradients, cinematic glow, warm
  lighting, and an emotionally appealing, dramatic atmosphere.
  `,

  forest: `
  Natural green tones with earthy colors, organic textures,
  calm and refreshing palette inspired by nature, balanced
  lighting, and a clean, peaceful visual atmosphere.
  `,

  neon: `
  Neon glow effects with electric blues, pinks, and purples,
  cyberpunk-inspired lighting, high contrast, glowing edges,
  futuristic and energetic aesthetic with strong visual punch.
  `,

  purple: `
  Purple-dominant color palette with violet, magenta, and
  lavender tones, modern and stylish mood, creative and
  premium look, smooth gradients, and elegant lighting.
  `,

  monochrome: `
  Black and white color scheme with strong contrast, dramatic
  lighting, deep shadows, minimalist aesthetic, timeless and
  cinematic visual style with a strong emotional focus.
  `,

  ocean: `
  Cool ocean-inspired tones with blues and teals, aquatic
  color palette, fresh and clean atmosphere, soft gradients,
  calming yet professional visual mood.
  `,

  pastel: `
  Soft pastel colors with low saturation, gentle tones,
  smooth gradients, light and friendly aesthetic, calming
  visual style, modern and approachable look.
  `
};


    /* ---------- SAVE INITIAL RECORD ---------- */
    const thumbnail = await thumbnailModel.create({
      userId,
      title,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true
    });

    /* ---------- BUILD PROMPT ---------- */
    let finalPrompt =
      `${stylePrompts[style] || stylePrompts["Bold & Graphic"]} for "${title}".`;

    if (color_scheme && colorSchemeDescriptions[color_scheme]) {
      finalPrompt += ` Use ${colorSchemeDescriptions[color_scheme]}.`;
    }

    if (user_prompt) {
      finalPrompt += ` ${user_prompt}.`;
    }

    if (text_overlay) {
      finalPrompt += ` Include text overlay: "${text_overlay}".`;
    }

    finalPrompt +=
      " High quality, professional YouTube thumbnail, optimized for high CTR.";

    /* ---------- REPLICATE (DOCUMENTATION-CORRECT) ---------- */

    const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(finalPrompt)}?model=flux&width=1280&height=720&key=${process.env.POLLINATIONS_API_KEY}`;


    /* ---------- CLOUDINARY ---------- */
    const upload = await cloudinary.uploader.upload(imageUrl,{
      folder:'thumbnails',
    });

    /* ---------- UPDATE DB ---------- */
    thumbnail.image_url = upload.secure_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    console.log("url:",upload.secure_url)

    return res.status(200).json({
      message: "Thumbnail generated successfully",
      thumbnail
    });

  } catch (error) {
    console.error("Thumbnail Error:", error);
    return res.status(500).json({
      message:error.message
    });
  }
};

export default GenerateThumbnail;  