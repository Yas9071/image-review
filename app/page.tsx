"use client";

import { useRef, useState } from "react";
type PaletteColor = [number, number, number];
// CODE GOES HERE

const SHORTCUTS = [
  {
    label: "Portrait",
    url: "https://images.unsplash.com/photo-1623472251571-961a9ea86784?q=80&w=1988&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Painting",
    url: "https://images.unsplash.com/photo-1581337204873-ef36aa186caa?q=80&w=2056&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    label: "Screenshot",
    url: "https://i.insider.com/4e0b8f4dccd1d54255060000?width=750&format=jpeg&auto=webp",
  },
] as const;

export default function Home() {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [dominantColor, setDominantColor] = useState<PaletteColor | null>(null);
  const [paletteStatus, setPaletteStatus] = useState("Pick an image to extract colours.");
  const [textResult, setTextResult] = useState("Pick an image to run OCR.");
  const [visionResult, setVisionResult] = useState("Pick an image to analyze.");

  async function processLoadedImage(currentRequestId: number) {
    const image = imgRef.current;

    if (!image) {
      return;
    }

    setPaletteStatus("Loading ...");
    setTextResult("Loading ...");
    setVisionResult("Loading ...");
    setPalette([]);
    setDominantColor(null);

    try {
      extractPalette(image);
      recognizeText(image);
      analyzeVision({
        imageUri: image.currentSrc || image.src,
        base64Content: imageBase64,
      });
    } catch (error) {
    }
  }

  function handleShortcut(url: string) {
    setImageBase64(null);
    setImageUrl(url);
  }

  function handleLocalImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPaletteStatus("Please choose an image file.");
      setTextResult("OCR not started. Please choose an image file.");
      setVisionResult("Vision analysis not started. Please choose an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;

      if (!dataUrl) {
        setPaletteStatus("Unable to read local image file.");
        setTextResult("Unable to run OCR because file reading failed.");
        setVisionResult("Unable to analyze image because file reading failed.");
        return;
      }

      const base64 = dataUrl.includes(",") ? dataUrl.split(",", 2)[1] : null;

      setImageBase64(base64);
      setImageUrl(dataUrl);
    };

    reader.onerror = () => {
      setPaletteStatus("Unable to read local image file.");
      setTextResult("Unable to run OCR because file reading failed.");
      setVisionResult("Unable to analyze image because file reading failed.");
    };

    reader.readAsDataURL(file);
  }

  function handleImageLoad() {
    requestIdRef.current += 1;
    void processLoadedImage(requestIdRef.current);
  }

  function handleImageError() {
    requestIdRef.current += 1;
    setPalette([]);
    setDominantColor(null);
    setPaletteStatus("Unable to load this image. The remote server may block cross-origin access.");
    setTextResult("Unable to run OCR because the image could not be loaded.");
    setVisionResult("Unable to analyze because the image could not be loaded.");
  }

  async function extractPalette(image: HTMLImageElement) {

    // CODE GOES HERE
    setPaletteStatus(`Colours extracted: `+imageUrl.length);
    setDominantColor([128, 64, 64]);
    setPalette([[128, 64, 64]]);

  }

  async function recognizeText(image: HTMLImageElement) {
    // CODE GOES HERE
    setTextResult(`Text extracted: `+imageUrl.length);
  }

  async function analyzeVision({
    imageUri,
    base64Content,
  }: {
    imageUri: string;
    base64Content?: string | null;
  }) {
    // CODE GOES HERE
    setVisionResult(`Vision extracted: `+imageUrl.length);
  }

  return (
    <div className="flex flex-1 justify-center px-4 py-10 font-sans text-foreground sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
        <div className="space-y-8 grid gap-6 lg:grid-cols-2">
          <section className="space-y-4">
            <div className="space-y-1 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
                Interactive Demo
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Computer Vision 👀
              </h1>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/55 text-center">
                Image
              </h4>
              {imageUrl != "" &&

                <div
                  ref={imageContainerRef}
                  className="relative overflow-hidden rounded-2xl border border-black/10 bg-stone-100 shadow-sm w-[33%] mx-auto"
                >
                  <img
                    id="image"
                    ref={imgRef}
                    src={imageUrl}
                    className="block w-full"
                    crossOrigin="anonymous"
                    // style={{ maxHeight: 500 }}
                    alt="Selected source"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>
              }

              <input
                id="url"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm outline-none transition focus:border-black/30 focus:ring-4 focus:ring-amber-200/60"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
              />

              <div id="shortcut" className="flex flex-wrap gap-2">
                {SHORTCUTS.map((shortcut) => (
                  <button
                    key={shortcut.label}
                    data-url={shortcut.url}
                    className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80"
                    type="button"
                    onClick={() => handleShortcut(shortcut.url)}
                  >
                    {shortcut.label}
                  </button>
                ))}
              </div>


              <input
                id="local-image"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black shadow-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-black/80"
                type="file"
                accept="image/*"
                onChange={handleLocalImage}
              />


            </div>
          </section>



          <div className="space-y-4">

            <section className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/55">
                Colour Palette
              </h4>
              <div
                id="palette"
                className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-dashed border-black/10 bg-white/60 p-4 overflow-hidden"
              >
                {paletteStatus}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/55">
                Text
              </h4>
              <div
                id="text"
                className="min-h-48 whitespace-pre-wrap rounded-2xl border border-black/10 bg-white/60 p-4 text-sm leading-6 text-black/75 shadow-sm"
              >
                {textResult}
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/55">
                Cloud Vision
              </h4>
              <pre
                id="vision"
                className="min-h-48 overflow-x-auto whitespace-pre-wrap rounded-2xl border border-black/10 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 shadow-sm"
              >
                {visionResult}
              </pre>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

