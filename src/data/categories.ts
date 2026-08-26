import type { CropCategory } from "./types";

export const CROP_CATEGORIES: {
  id: CropCategory;
  label: string;
  shortLabel: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "vegetables",
    label: "Vegetables",
    shortLabel: "Vegetables",
    emoji: "🥬",
    description: "Tomato, onion, potato and leafy produce",
  },
  {
    id: "fruits",
    label: "Fruits",
    shortLabel: "Fruits",
    emoji: "🍎",
    description: "Mango, banana, citrus and orchard crops",
  },
  {
    id: "grains",
    label: "Grains & Cereals",
    shortLabel: "Grains",
    emoji: "🌾",
    description: "Rice, wheat, maize and millets",
  },
  {
    id: "pulses",
    label: "Pulses",
    shortLabel: "Pulses",
    emoji: "🫘",
    description: "Toor, moong, chana and dals",
  },
  {
    id: "oilseeds",
    label: "Oilseeds",
    shortLabel: "Oilseeds",
    emoji: "🌻",
    description: "Groundnut, mustard, soybean and sesame",
  },
  {
    id: "spices",
    label: "Spices",
    shortLabel: "Spices",
    emoji: "🌶️",
    description: "Turmeric, pepper, cumin and chilli",
  },
  {
    id: "commercial",
    label: "Commercial Crops",
    shortLabel: "Commercial",
    emoji: "🌱",
    description: "Sugarcane, cotton, jute and tobacco",
  },
];
