"use client";

import { useState } from "react";
import type { Crop } from "@/data/types";

type CropImageProps = {
  crop: Pick<Crop, "name" | "emoji" | "image">;
  className?: string;
};

export default function CropImage({ crop, className = "" }: CropImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`crop-image ${className}`}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={crop.image}
          alt={crop.name}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="crop-image__fallback" aria-hidden>
          {crop.emoji}
        </span>
      )}
    </div>
  );
}
