import type { Crop, CropCategory, PriceUnit } from "./types";

const img = (photoId: string) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&h=600&q=80`;

function crop(
  id: string,
  name: string,
  emoji: string,
  category: CropCategory,
  image: string,
  unit: PriceUnit,
  minDays: number,
  maxDays: number,
  harvestStage: string,
  samplePrice: number,
  extraTerms: string[] = [],
): Crop {
  return {
    id,
    name,
    emoji,
    category,
    image,
    unit,
    averageGrowthDays: { min: minDays, max: maxDays },
    harvestStage,
    samplePrice,
    searchTerms: [name, category, id, ...extraTerms].map((term) =>
      term.toLowerCase(),
    ),
  };
}

export const CROPS: Crop[] = [
  crop("tomato", "Tomato", "🍅", "vegetables", img("photo-1592924357228-91a4daadcfea"), "kg", 90, 120, "Full maturity, firm red fruit", 50, ["tamatar"]),
  crop("potato", "Potato", "🥔", "vegetables", img("photo-1518977676601-b53f82aba655"), "kg", 90, 120, "Skin set, vines dried", 30, ["aloo"]),
  crop("onion", "Onion", "🧅", "vegetables", img("photo-1508747703725-619426870bad"), "kg", 100, 140, "Neck fall, bulbs fully formed", 40, ["pyaz"]),
  crop("carrot", "Carrot", "🥕", "vegetables", img("photo-1598170845058-32b9d6a5da37"), "kg", 70, 100, "Roots fully sized", 35),
  crop("cabbage", "Cabbage", "🥬", "vegetables", img("photo-1594282486552-05b4d80fbb9f"), "kg", 70, 100, "Firm compact heads", 22),
  crop("cauliflower", "Cauliflower", "🥦", "vegetables", img("photo-1568584711075-3d021a7c3ca3"), "kg", 55, 80, "Tight white curds", 28),
  crop("brinjal", "Brinjal", "🍆", "vegetables", img("photo-1590301157890-4810ed352733"), "kg", 70, 90, "Glossy, tender fruit", 32, ["eggplant", "baingan"]),
  crop("green-chilli", "Green Chilli", "🌶️", "vegetables", img("photo-1588879460618-9249e7d947d1"), "kg", 60, 90, "Firm green pods", 80, ["chilli", "mirchi"]),
  crop("capsicum", "Capsicum", "🫑", "vegetables", img("photo-1563565375-f3fdfdbefa83"), "kg", 70, 90, "Full colour, firm walls", 55, ["bell pepper"]),
  crop("cucumber", "Cucumber", "🥒", "vegetables", img("photo-1449300079323-02e209d9d3a6"), "kg", 45, 70, "Tender, medium-sized fruit", 25),
  crop("pumpkin", "Pumpkin", "🎃", "vegetables", img("photo-1506917728037-b6af01a7d403"), "kg", 90, 120, "Hard rind, hollow sound", 18),
  crop("bitter-gourd", "Bitter Gourd", "🥒", "vegetables", img("photo-1589927986089-35812388d1f4"), "kg", 55, 70, "Firm, green, tender", 40, ["karela"]),
  crop("bottle-gourd", "Bottle Gourd", "🥬", "vegetables", img("photo-1601493700631-2b16ec4b4716"), "kg", 55, 80, "Tender, pale green skin", 20, ["lauki"]),
  crop("okra", "Okra", "🌿", "vegetables", img("photo-1628773822503-930a7eaecf80"), "kg", 45, 65, "Tender 7–10 cm pods", 38, ["bhindi", "ladyfinger"]),
  crop("beans", "Beans", "🫘", "vegetables", img("photo-1551462147-ff29053bfc14"), "kg", 50, 70, "Tender snap pods", 42),
  crop("peas", "Peas", "🟢", "vegetables", img("photo-1587735243615-c03f25aaff15"), "kg", 60, 90, "Filled, sweet pods", 48, ["matar"]),
  crop("spinach", "Spinach", "🥬", "vegetables", img("photo-1576045057995-568f588f82fb"), "kg", 30, 45, "Young tender leaves", 20, ["palak"]),
  crop("beetroot", "Beetroot", "🟣", "vegetables", img("photo-1526470608268-f674ce90ebd4"), "kg", 55, 70, "Roots 5–8 cm diameter", 30),
  crop("radish", "Radish", "⚪", "vegetables", img("photo-1590779033100-9f60a05a013d"), "kg", 30, 50, "Crisp, fully sized roots", 18, ["mooli"]),
  crop("garlic", "Garlic", "🧄", "vegetables", img("photo-1540148426945-6cf22a6b2383"), "kg", 120, 180, "Bulbs mature, leaves dry", 140, ["lahsun"]),
  crop("ginger", "Ginger", "🫚", "vegetables", img("photo-1615485290382-441e4d049cb5"), "kg", 210, 270, "Rhizomes fully developed", 90, ["adrak"]),

  crop("mango", "Mango", "🥭", "fruits", img("photo-1553279768-865429fa0078"), "kg", 100, 150, "Full colour, slight give", 80, ["aam"]),
  crop("banana", "Banana", "🍌", "fruits", img("photo-1571771894821-ce9b6c11b08e"), "kg", 270, 365, "Full fingers, light green-yellow", 45, ["kela"]),
  crop("apple", "Apple", "🍎", "fruits", img("photo-1560806887-1e4cd0b6cbd6"), "kg", 120, 180, "Full colour, firm fruit", 120, ["seb"]),
  crop("grapes", "Grapes", "🍇", "fruits", img("photo-1537640538966-79f369143f8f"), "kg", 120, 150, "Sweet berries, full bunches", 70, ["angoor"]),
  crop("orange", "Orange", "🍊", "fruits", img("photo-1547514701-4278210176e7"), "kg", 210, 270, "Full colour, juicy", 55, ["santra"]),
  crop("pomegranate", "Pomegranate", "🩷", "fruits", img("photo-1577069861033-55d04cec4ef5"), "kg", 150, 180, "Metallic sound, cracked calyx", 95, ["anar"]),
  crop("papaya", "Papaya", "🧡", "fruits", img("photo-1517282009859-f000ec3b1101"), "kg", 180, 270, "Colour break, slight softness", 30, ["papeeta"]),
  crop("watermelon", "Watermelon", "🍉", "fruits", img("photo-1587049352846-4a222e784d38"), "kg", 80, 100, "Dry tendril, hollow sound", 18),
  crop("muskmelon", "Muskmelon", "🍈", "fruits", img("photo-1571575173700-af73dd5b5dd1"), "kg", 70, 90, "Sweet aroma, netted rind", 25, ["kharbooja"]),
  crop("guava", "Guava", "🟢", "fruits", img("photo-1536511132770-e5058c7e8c46"), "kg", 150, 240, "Light colour change", 40, ["amrud"]),
  crop("pineapple", "Pineapple", "🍍", "fruits", img("photo-1550258987-190a2d41a8ba"), "kg", 540, 720, "Golden base, sweet aroma", 50),
  crop("coconut", "Coconut", "🥥", "fruits", img("photo-1580984969071-a8da565201b6"), "kg", 365, 720, "Mature brown nuts", 35, ["nariyal"]),
  crop("sapota", "Sapota", "🟤", "fruits", img("photo-1596797038530-2c107229654b"), "kg", 180, 240, "Brown skin, slight softness", 60, ["chikoo"]),
  crop("lemon", "Lemon", "🍋", "fruits", img("photo-1590502593747-42a996133562"), "kg", 150, 180, "Full size, yellow-green", 50, ["nimbu"]),

  crop("rice", "Rice", "🌾", "grains", img("photo-1536304993881-ff6e1eef2b64"), "quintal", 110, 150, "80–85% grains golden", 2800, ["paddy", "dhan"]),
  crop("wheat", "Wheat", "🌾", "grains", img("photo-1574323347407-f5e1ad6d020b"), "quintal", 110, 140, "Golden, hard grain", 2400, ["gehun"]),
  crop("maize", "Maize", "🌽", "grains", img("photo-1551754655-cd27e38d2076"), "quintal", 90, 120, "Dent stage, dry husk", 2200, ["corn", "makka"]),
  crop("jowar", "Jowar", "🌾", "grains", img("photo-1574943320219-553eb213f72d"), "quintal", 100, 130, "Hard grain, dry panicle", 2100, ["sorghum"]),
  crop("bajra", "Bajra", "🌾", "grains", img("photo-1625246333195-78d9c38ad449"), "quintal", 70, 90, "Hard grey grain", 1950, ["pearl millet"]),
  crop("ragi", "Ragi", "🌾", "grains", img("photo-1500382017468-9049fed747ef"), "quintal", 100, 130, "Brown ears fully dry", 2800, ["finger millet"]),
  crop("barley", "Barley", "🌾", "grains", img("photo-1586201375761-83865001e31c"), "quintal", 90, 120, "Golden spikes", 1850, ["jau"]),

  crop("toor", "Toor Dal", "🫘", "pulses", img("photo-1586201375761-83865001e31c"), "quintal", 150, 180, "Dry pods, hard seed", 7200, ["arhar", "pigeon pea"]),
  crop("moong", "Moong", "🟢", "pulses", img("photo-1599940824399-b87987ceb72a"), "quintal", 60, 75, "Black pods, hard seed", 6800, ["green gram"]),
  crop("urad", "Urad", "⚫", "pulses", img("photo-1515543901753-3b1651423068"), "quintal", 70, 90, "Dry black pods", 7400, ["black gram"]),
  crop("chana", "Chana", "🟡", "pulses", img("photo-1546069901-ba9599a7e63c"), "quintal", 90, 120, "Dry plants, hard seed", 5400, ["chickpea", "gram"]),
  crop("masoor", "Masoor", "🔴", "pulses", img("photo-1509358278946-5f3b6d0b5b0b"), "quintal", 100, 120, "Dry pods", 6100, ["lentil"]),

  crop("groundnut", "Groundnut", "🥜", "oilseeds", img("photo-1606923829579-0cb981a83e2e"), "quintal", 90, 130, "Inner hull veined, kernels full", 5800, ["peanut", "moongfali"]),
  crop("sunflower", "Sunflower", "🌻", "oilseeds", img("photo-1597848212624-e6ac1bd54f41"), "quintal", 80, 100, "Back of head yellow-brown", 5200),
  crop("soybean", "Soybean", "🟡", "oilseeds", img("photo-1567306226416-28f0efdc88ce"), "quintal", 90, 120, "Pods rattle when shaken", 4300),
  crop("mustard", "Mustard", "🌼", "oilseeds", img("photo-1558618666-fcd25c85cd64"), "quintal", 110, 140, "Pods brown, seed rattles", 5100, ["sarson"]),
  crop("sesame", "Sesame", "⚪", "oilseeds", img("photo-1508747703725-619426870bad"), "quintal", 80, 100, "Lower capsules split", 8900, ["til"]),

  crop("turmeric", "Turmeric", "🟡", "spices", img("photo-1615485290382-441e4d049cb5"), "quintal", 210, 270, "Leaves dry, rhizomes mature", 7800, ["haldi"]),
  crop("black-pepper", "Black Pepper", "⚫", "spices", img("photo-1509358278946-5f3b6d0b5b0b"), "kg", 180, 240, "Berries firm, start yellowing", 520, ["kali mirch"]),
  crop("coriander", "Coriander", "🌿", "spices", img("photo-1607305387299-a3d9611cd293"), "quintal", 90, 120, "Seeds hard, plants dry", 6400, ["dhania"]),
  crop("cumin", "Cumin", "🟤", "spices", img("photo-1596040033229-a9821ebd058d"), "quintal", 100, 120, "Seeds grey-brown, dry", 18500, ["jeera"]),
  crop("cardamom", "Cardamom", "🟢", "spices", img("photo-1509358278946-5f3b6d0b5b0b"), "kg", 730, 1095, "Capsules full, pale green", 1800, ["elaichi"]),
  crop("red-chilli", "Red Chilli", "🌶️", "spices", img("photo-1583119022894-919a68a3d0e3"), "quintal", 90, 150, "Pods fully red and dry", 12500, ["lal mirch"]),

  crop("sugarcane", "Sugarcane", "🎋", "commercial", img("photo-1500382017468-9049fed747ef"), "quintal", 300, 420, "12–14 month cane, high Brix", 350, ["ganna"]),
  crop("cotton", "Cotton", "☁️", "commercial", img("photo-1606923829579-0cb981a83e2e"), "quintal", 150, 180, "Bolls fully open", 7000, ["kapas"]),
  crop("tobacco", "Tobacco", "🍂", "commercial", img("photo-1574323347407-f5e1ad6d020b"), "quintal", 90, 120, "Leaves mature, slightly yellow", 14500),
  crop("jute", "Jute", "🌿", "commercial", img("photo-1536304993881-ff6e1eef2b64"), "quintal", 100, 130, "Small pods, 50% flowering", 4200),
];

export const CROPS_BY_ID = Object.fromEntries(
  CROPS.map((item) => [item.id, item]),
) as Record<string, Crop>;
