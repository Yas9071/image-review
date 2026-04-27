
"use client";

import { useRef, useState } from "react";
import Tesseract from "tesseract.js";

type PaletteColor = [number, number, number];

export default function Home() {
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imageUrl, setImageUrl] = useState("");
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [paletteStatus, setPaletteStatus] = useState("Pick an image to extract colours.");
  const [textResult, setTextResult] = useState("Pick an image to run OCR.");
  const [visionResult, setVisionResult] = useState("Pick an image to analyze.");

  function handleLocalImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  function handleImageLoad() {
    const image = imgRef.current;
    if (!image) return;

    extractPalette(image);
    recognizeText(image);
    analyzeVision(image);
  }

  // SIMPLE COLOR EXTRACTION (Canvas)
  function extractPalette(image: HTMLImageElement) {
    try {
      setPaletteStatus("Extracting colours...");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      const colors: PaletteColor[] = [];

      for (let i = 0; i < imageData.length; i += 4000) {
        colors.push([
          imageData[i],
          imageData[i + 1],
          imageData[i + 2],
        ]);
      }

      setPalette(colors.slice(0, 5));
      setPaletteStatus("Colours extracted successfully.");
    } catch {
      setPaletteStatus("Color extraction failed.");
    }
  }

  // OCR
  async function recognizeText(image: HTMLImageElement) {
    try {
      setTextResult("Reading text...");

      const result = await Tesseract.recognize(image.src, "eng");

      const text = result.data.text.trim();

      setTextResult(text || "No readable text found.");
    } catch {
      setTextResult("OCR failed.");
    }
  }

  // BASIC VISION
  function analyzeVision(image: HTMLImageElement) {
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    let orientation = "Square";
    if (width > height) orientation = "Landscape";
    if (height > width) orientation = "Portrait";

    const result = {
      width,
      height,
      orientation,
      review: "Image ready for production review",
    };

    setVisionResult(JSON.stringify(result, null, 2));
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Computer Vision Demo</h1>

      <input type="file" accept="image/*" onChange={handleLocalImage} />

      {imageUrl && (
        <div style={{ marginTop: 20 }}>
          <img
            ref={imgRef}
            src={imageUrl}
            width={300}
            onLoad={handleImageLoad}
          />
        </div>
      )}

      <h3>Colours</h3>
      <p>{paletteStatus}</p>
      <div style={{ display: "flex", gap: 10 }}>
        {palette.map((c, i) => (
          <div
            key={i}
            style={{
              width: 40,
              height: 40,
              backgroundColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
            }}
          />
        ))}
      </div>

      <h3>Text (OCR)</h3>
      <p>{textResult}</p>

      <h3>Vision Analysis</h3>
      <pre>{visionResult}</pre>
    </div>
  );
}