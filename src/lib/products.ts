/* ==========================================================================
   NEMTEK STORE — Product catalogue (NEMTEK electric fencing + CENTURION gates)
   Prices in Ghana Cedis (GH₵) from the supplied product list.
   ========================================================================== */

export type CategoryKey =
  | "energizers"
  | "keypads"
  | "wire-cable"
  | "gate-motors"
  | "access-control"
  | "boards"
  | "remotes"
  | "power"
  | "lighting-alarm"
  | "gate-contacts"
  | "signage"
  | "accessories";

export type Brand = "NEMTEK" | "CENTURION";

export interface Product {
  id: string;
  brand: Brand;
  name: string;
  price: number;
  category: CategoryKey;
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  desc: string;
}

export const CATEGORIES: Record<CategoryKey, { label: string; icon: string }> = {
  energizers: { label: "Energizers", icon: "energizer" },
  keypads: { label: "Keypads & Control", icon: "keypad" },
  "wire-cable": { label: "Wire & Cable", icon: "wire" },
  "gate-motors": { label: "Gate Motors", icon: "motor" },
  "access-control": { label: "Access Control", icon: "access" },
  boards: { label: "Control Boards", icon: "board" },
  remotes: { label: "Remotes & Receivers", icon: "remote" },
  power: { label: "Power & Chargers", icon: "power" },
  "lighting-alarm": { label: "Lighting & Alarms", icon: "siren" },
  "gate-contacts": { label: "Gate Contacts", icon: "contact" },
  signage: { label: "Signage", icon: "sign" },
  accessories: { label: "Hardware & Accessories", icon: "bolt" },
};

export const PRODUCTS: Product[] = [
  /* ------------------------- NEMTEK ENERGIZERS ------------------------- */
  { id: "nt-merlin4", brand: "NEMTEK", name: "Merlin 4 Energizer with Keypad (UK Plug)", price: 3100, category: "energizers", rating: 4.9, reviews: 142, stock: 12, badge: "Best Seller",
    desc: "Flagship 4-zone LCD energizer with built-in keypad. Powers large perimeters with precise voltage monitoring and alarm outputs." },
  { id: "nt-merlin2j", brand: "NEMTEK", name: "Merlin 2J Energizer with Keypad (UK Plug)", price: 2900, category: "energizers", rating: 4.8, reviews: 98, stock: 15, badge: "Popular",
    desc: "2 Joule single-zone energizer with integrated keypad — ideal for residential and small commercial fences." },
  { id: "nt-stealth", brand: "NEMTEK", name: "Merlin Stealth M18S (BJ/UK Plug) with Keypad", price: 4850, category: "energizers", rating: 5.0, reviews: 61, stock: 6, badge: "Premium",
    desc: "High-performance stealth energizer with advanced monitoring and tamper detection for demanding security installations." },
  { id: "nt-druid13", brand: "NEMTEK", name: "Druid 13 LCD 3J Energizer (UK Plug)", price: 2500, category: "energizers", rating: 4.7, reviews: 73, stock: 10,
    desc: "3 Joule LCD energizer with clear digital readout, multiple alarm modes and gate monitoring." },
  { id: "nt-merlin4i-pcb", brand: "NEMTEK", name: "Merlin 4I PCB (New)", price: 1450, category: "energizers", rating: 4.6, reviews: 24, stock: 8,
    desc: "Replacement main PCB for the Merlin 4I energizer. Genuine NEMTEK spare part." },

  /* ------------------------- NEMTEK KEYPADS ------------------------- */
  { id: "nt-keypad1", brand: "NEMTEK", name: "Merlin Keypad 1 Zone", price: 650, category: "keypads", rating: 4.7, reviews: 40, stock: 20,
    desc: "Single-zone control keypad with LCD display for arming, disarming and voltage status." },

  /* ------------------------- NEMTEK WIRE & CABLE ------------------------- */
  { id: "nt-ss-1mm", brand: "NEMTEK", name: "Stainless Steel Wire 1mm 304 (12.5kg)", price: 1750, category: "wire-cable", rating: 4.8, reviews: 55, stock: 18, badge: "Bulk",
    desc: "304-grade stainless steel fence wire, 1mm. 12.5kg reel for long perimeter runs with excellent conductivity." },
  { id: "nt-ss-12mm", brand: "NEMTEK", name: "Stainless Steel Wire 1.2mm 304 (7kg)", price: 900, category: "wire-cable", rating: 4.7, reviews: 31, stock: 22,
    desc: "Heavier 1.2mm 304 stainless steel wire, 7kg reel. Extra strength for high-tension lines." },
  { id: "nt-ht-slim", brand: "NEMTEK", name: "HT Cable Black Slim Line NT 100m", price: 750, category: "wire-cable", rating: 4.6, reviews: 29, stock: 25,
    desc: "100m slimline high-tension lead-out cable, double insulated for underground and gate crossings." },
  { id: "nt-ht-4core", brand: "NEMTEK", name: "HT Cable Black 4-Core 100m", price: 1950, category: "wire-cable", rating: 4.8, reviews: 18, stock: 9,
    desc: "4-core high-tension cable, 100m — connect multiple zones through a single run." },
  { id: "nt-comms-4", brand: "NEMTEK", name: "Comms Cable 4-Core White Stranded", price: 300, category: "wire-cable", rating: 4.5, reviews: 12, stock: 40,
    desc: "4-core stranded communications cable for keypad and energizer networking." },
  { id: "nt-comms-6", brand: "NEMTEK", name: "Comms Cable 6-Core White Stranded", price: 350, category: "wire-cable", rating: 4.5, reviews: 10, stock: 35,
    desc: "6-core stranded communications cable for multi-zone keypad installations." },

  /* ------------------------- NEMTEK POWER ------------------------- */
  { id: "nt-battery", brand: "NEMTEK", name: "Energizer Backup Battery", price: 350, category: "power", rating: 4.6, reviews: 48, stock: 30,
    desc: "Sealed rechargeable backup battery keeps your fence live during power outages." },
  { id: "nt-charger", brand: "NEMTEK", name: "Charger Transformer (W2 / M2 / M4)", price: 750, category: "power", rating: 4.5, reviews: 15, stock: 14,
    desc: "Replacement charging transformer compatible with W2, M2 and M4 energizers." },
  { id: "nt-w2m2m4", brand: "NEMTEK", name: "W2 / M2 / M4 Assembly (New)", price: 1150, category: "power", rating: 4.6, reviews: 9, stock: 7,
    desc: "Complete internal assembly for W2, M2 and M4 energizer families." },

  /* ------------------------- NEMTEK LIGHTING & ALARM ------------------------- */
  { id: "nt-fencelight", brand: "NEMTEK", name: "Fence Light", price: 180, category: "lighting-alarm", rating: 4.4, reviews: 22, stock: 50,
    desc: "Status indicator light for fence lines — visible deterrent and quick fault reference." },
  { id: "nt-strobe", brand: "NEMTEK", name: "Strobe Light Red LED 12V", price: 90, category: "lighting-alarm", rating: 4.5, reviews: 33, stock: 60,
    desc: "Bright 12V red LED strobe that triggers on alarm for an unmistakable visual alert." },
  { id: "nt-siren15", brand: "NEMTEK", name: "Siren 15W 12V", price: 90, category: "lighting-alarm", rating: 4.4, reviews: 27, stock: 45,
    desc: "Compact 15W 12V siren with piercing output for perimeter breach alerts." },
  { id: "nt-sirenbig", brand: "NEMTEK", name: "Siren Big (High Output)", price: 200, category: "lighting-alarm", rating: 4.6, reviews: 14, stock: 20,
    desc: "High-output siren for large sites where maximum audible deterrence is needed." },

  /* ------------------------- NEMTEK GATE CONTACTS ------------------------- */
  { id: "nt-sgc-std", brand: "NEMTEK", name: "Sliding Gate Contact — Standard Stainless Steel", price: 200, category: "gate-contacts", rating: 4.5, reviews: 19, stock: 28,
    desc: "Standard stainless steel sliding gate contact to carry the fence line across moving gates." },
  { id: "nt-sgc-inline", brand: "NEMTEK", name: "Sliding Gate Contact In-Line SGC07", price: 400, category: "gate-contacts", rating: 4.6, reviews: 11, stock: 16,
    desc: "In-line SGC07 sliding gate contact for a clean, reliable crossing connection." },
  { id: "nt-sgc-bracket", brand: "NEMTEK", name: "Sliding Gate Contact — Universal Bracket", price: 250, category: "gate-contacts", rating: 4.5, reviews: 8, stock: 24,
    desc: "Universal mounting bracket to fit sliding gate contacts to almost any gate." },

  /* ------------------------- NEMTEK REMOTES / RX ------------------------- */
  { id: "nt-sherlo-rx2", brand: "NEMTEK", name: "Sherlo Receiver 2 Channel RX2-150m", price: 350, category: "remotes", rating: 4.6, reviews: 21, stock: 18,
    desc: "2-channel 150m range receiver for remote arming and gate control." },
  { id: "nt-sherlo-tx2", brand: "NEMTEK", name: "Sherlo Transmitter 2-Button Code Hop", price: 250, category: "remotes", rating: 4.6, reviews: 26, stock: 32,
    desc: "2-button code-hopping remote transmitter — secure rolling-code technology." },

  /* ------------------------- NEMTEK SIGNAGE ------------------------- */
  { id: "nt-warnsign", brand: "NEMTEK", name: "Warning Sign — Danger Electric Fence", price: 12, category: "signage", rating: 4.8, reviews: 90, stock: 200, badge: "Required",
    desc: "Compliant yellow danger sign. Required by regulation at regular intervals along electric fences." },

  /* ------------------------- NEMTEK HARDWARE / ACCESSORIES ------------------------- */
  { id: "nt-ferr-cu", brand: "NEMTEK", name: "Ferrules 6mm Soft Tinned Copper (100 Pack)", price: 150, category: "accessories", rating: 4.7, reviews: 37, stock: 40,
    desc: "100-pack of 6mm soft tinned copper crimp ferrules for strong, low-resistance joins." },
  { id: "nt-ferr-al", brand: "NEMTEK", name: "Ferrules Aluminium (100 Pack)", price: 100, category: "accessories", rating: 4.5, reviews: 20, stock: 45,
    desc: "100-pack aluminium crimp ferrules for terminating stainless steel fence wire." },
  { id: "nt-bobbins", brand: "NEMTEK", name: "Bobbins Black Flat / Square", price: 1.4, category: "accessories", rating: 4.4, reviews: 60, stock: 500, badge: "Low Price",
    desc: "Insulating bobbins for wall-top and bracket installations. Priced per unit." },
  { id: "nt-springhook", brand: "NEMTEK", name: "Spring Hook Stainless Steel — Large Tail", price: 100, category: "accessories", rating: 4.5, reviews: 14, stock: 60,
    desc: "Large-tail stainless steel spring hook for secure tensioning at straining posts." },
  { id: "nt-compspring", brand: "NEMTEK", name: "Compression Spring 1 Loop 5kg (Silver/Black)", price: 5.4, category: "accessories", rating: 4.4, reviews: 18, stock: 300,
    desc: "Single-loop 5kg compression spring maintains constant tension on the fence line." },
  { id: "nt-compspring-blk", brand: "NEMTEK", name: "Compression Spring Black", price: 210, category: "accessories", rating: 4.5, reviews: 7, stock: 40,
    desc: "Heavy-duty black compression spring for high-tension straining applications." },
  { id: "nt-nailanchor", brand: "NEMTEK", name: "Nail-In Anchor 6×60mm (Box of 100)", price: 100, category: "accessories", rating: 4.6, reviews: 12, stock: 50,
    desc: "100-box of 6×60mm nail-in anchors for fast fixing of brackets to masonry." },
  { id: "nt-inlineloop", brand: "NEMTEK", name: "In-Line Loop Galvanised", price: 10, category: "accessories", rating: 4.3, reviews: 9, stock: 150,
    desc: "Galvanised in-line loop for neat directional changes along the fence run." },
  { id: "nt-staylug-600", brand: "NEMTEK", name: "Stay & Lug 600mm Black", price: 30, category: "accessories", rating: 4.4, reviews: 11, stock: 80,
    desc: "600mm black stay and lug for corner and end-post bracing." },
  { id: "nt-staylug-750", brand: "NEMTEK", name: "Stay & Lug 750mm Black", price: 35, category: "accessories", rating: 4.4, reviews: 10, stock: 70,
    desc: "750mm black stay and lug for extra reach on taller installations." },
  { id: "nt-tension-str", brand: "NEMTEK", name: "Stranded Tension Spring", price: 350, category: "accessories", rating: 4.5, reviews: 6, stock: 25,
    desc: "Stranded tension assembly for reliable long-run tensioning." },
  { id: "nt-tension-al", brand: "NEMTEK", name: "Aluminium Tension Spring", price: 750, category: "accessories", rating: 4.6, reviews: 5, stock: 15,
    desc: "Premium aluminium tension assembly for high-performance perimeters." },

  /* ======================= CENTURION — GATE MOTORS ======================= */
  { id: "ct-d5evo", brand: "CENTURION", name: "D5 EVO Smart Plus Gate Motor", price: 6450, category: "gate-motors", rating: 4.9, reviews: 120, stock: 10, badge: "Best Seller",
    desc: "Smart Plus sliding gate operator with onboard Bluetooth, status LEDs and app control. For gates up to 500kg." },
  { id: "ct-d6", brand: "CENTURION", name: "D6 Smart Plus Gate Motor", price: 7300, category: "gate-motors", rating: 4.8, reviews: 64, stock: 8,
    desc: "Heavy-duty Smart Plus operator for residential estates and light commercial gates." },
  { id: "ct-d10", brand: "CENTURION", name: "D10 Smart Plus Gate Motor", price: 11800, category: "gate-motors", rating: 4.9, reviews: 42, stock: 5, badge: "Industrial",
    desc: "Industrial sliding gate operator for the heaviest gates and highest duty cycles." },
  { id: "ct-d10turbo", brand: "CENTURION", name: "D10 Turbo Smart Plus Gate Motor", price: 11700, category: "gate-motors", rating: 4.9, reviews: 20, stock: 4,
    desc: "High-speed D10 Turbo for large industrial gates needing fast open/close cycles." },
  { id: "ct-vantage", brand: "CENTURION", name: "Vantage Swing Gate Operator", price: 12500, category: "gate-motors", rating: 4.8, reviews: 15, stock: 3, badge: "Premium",
    desc: "Articulated-arm operator for swing gates with smooth, powerful motion." },
  { id: "ct-d3", brand: "CENTURION", name: "D3 Smart Plus Gate Motor", price: 4900, category: "gate-motors", rating: 4.7, reviews: 33, stock: 12,
    desc: "Compact Smart Plus sliding operator for lighter residential gates." },
  { id: "ct-d4", brand: "CENTURION", name: "D4 Smart Plus Gate Motor", price: 5650, category: "gate-motors", rating: 4.7, reviews: 28, stock: 11,
    desc: "Mid-range Smart Plus sliding operator balancing power and value." },
  { id: "ct-d2kit", brand: "CENTURION", name: "D2 Full Kit", price: 4250, category: "gate-motors", rating: 4.6, reviews: 25, stock: 9, badge: "Full Kit",
    desc: "Complete D2 sliding gate kit including operator, rack, remotes and safety accessories." },
  { id: "ct-d20kit", brand: "CENTURION", name: "D20 Smart Plus Kit", price: 12400, category: "gate-motors", rating: 4.8, reviews: 8, stock: 3, badge: "Full Kit",
    desc: "Industrial D20 Smart Plus complete kit for the most demanding installations." },
  { id: "ct-d6op", brand: "CENTURION", name: "D6 Smart Operator (Unit Only)", price: 6350, category: "gate-motors", rating: 4.7, reviews: 9, stock: 6,
    desc: "D6 Smart Plus operator head unit for replacement or custom builds." },
  { id: "ct-d5evoop", brand: "CENTURION", name: "D5 EVO Smart Operator (Unit Only)", price: 5700, category: "gate-motors", rating: 4.7, reviews: 11, stock: 7,
    desc: "D5 EVO Smart operator head unit — genuine Centurion replacement." },
  { id: "ct-d20op", brand: "CENTURION", name: "D20 Smart Operator (Unit Only)", price: 8400, category: "gate-motors", rating: 4.7, reviews: 5, stock: 4,
    desc: "D20 industrial operator head unit for heavy sliding gates." },
  { id: "ct-d20splus-op", brand: "CENTURION", name: "D20 Smart Plus Operator (Unit Only)", price: 11350, category: "gate-motors", rating: 4.8, reviews: 4, stock: 3,
    desc: "D20 Smart Plus operator with full smart feature set." },
  { id: "ct-d10t-op", brand: "CENTURION", name: "D10 Turbo Smart Plus Operator (Unit Only)", price: 10700, category: "gate-motors", rating: 4.8, reviews: 4, stock: 3,
    desc: "D10 Turbo Smart Plus operator head for high-speed industrial gates." },
  { id: "ct-d10splus-op", brand: "CENTURION", name: "D10 Smart Plus Operator (Unit Only)", price: 10770, category: "gate-motors", rating: 4.8, reviews: 5, stock: 4,
    desc: "D10 Smart Plus operator head unit for industrial sliding gates." },
  { id: "ct-d4op", brand: "CENTURION", name: "D4 Smart Plus Operator (Unit Only)", price: 5000, category: "gate-motors", rating: 4.6, reviews: 7, stock: 8,
    desc: "D4 Smart Plus operator head unit for mid-range sliding gates." },
  { id: "ct-d3op", brand: "CENTURION", name: "D3 Smart Plus Operator (Unit Only)", price: 4300, category: "gate-motors", rating: 4.6, reviews: 6, stock: 9,
    desc: "D3 Smart Plus operator head unit for light residential gates." },

  /* ------------------------- CENTURION ACCESS CONTROL ------------------------- */
  { id: "ct-gspeak", brand: "CENTURION", name: "G-SPEAK Ultra GSM Intercom", price: 2600, category: "access-control", rating: 4.7, reviews: 18, stock: 10, badge: "Smart",
    desc: "GSM intercom that routes gate calls to your phone — grant access from anywhere." },
  { id: "ct-gswitch", brand: "CENTURION", name: "G-SWITCH Ultra GSM Relay", price: 2300, category: "access-control", rating: 4.7, reviews: 14, stock: 11,
    desc: "GSM switching relay to operate your gate via a phone call or app." },
  { id: "ct-smartguard", brand: "CENTURION", name: "SMART Guard Keypad", price: 900, category: "access-control", rating: 4.6, reviews: 22, stock: 20,
    desc: "Standalone code keypad for keyless access, up to 1000 users." },
  { id: "ct-smartguardair", brand: "CENTURION", name: "SMART Guard Air (Wireless Keypad)", price: 950, category: "access-control", rating: 4.6, reviews: 16, stock: 18,
    desc: "Wireless version of SMART Guard for easy install where cabling is difficult." },
  { id: "ct-sdo5", brand: "CENTURION", name: "SDO5 Garage Door Operator", price: 3500, category: "access-control", rating: 4.6, reviews: 12, stock: 7,
    desc: "Sectional/garage door operator with smart safety and remote control." },
  { id: "ct-i5v3", brand: "CENTURION", name: "I5 V3 Infrared Safety Beams", price: 500, category: "access-control", rating: 4.5, reviews: 24, stock: 30,
    desc: "Infrared safety beam set — stops the gate when the beam is interrupted." },
  { id: "ct-photon", brand: "CENTURION", name: "Photon Safety Beams", price: 900, category: "access-control", rating: 4.6, reviews: 19, stock: 22,
    desc: "Reliable photon safety beams for gate and vehicle safety protection." },
  { id: "ct-photonsmart", brand: "CENTURION", name: "Photon Smart Safety Beams", price: 900, category: "access-control", rating: 4.6, reviews: 10, stock: 20,
    desc: "Smart photon beams with enhanced alignment and diagnostics." },

  /* ------------------------- CENTURION BOARDS ------------------------- */
  { id: "ct-d5evoboard", brand: "CENTURION", name: "D5 EVO Control Board", price: 1700, category: "boards", rating: 4.6, reviews: 9, stock: 8,
    desc: "Genuine D5 EVO replacement controller PCB." },
  { id: "ct-d10board", brand: "CENTURION", name: "D10 Control Board", price: 1800, category: "boards", rating: 4.6, reviews: 7, stock: 6,
    desc: "Genuine D10 replacement controller PCB." },
  { id: "ct-dxboard", brand: "CENTURION", name: "DX Control Board", price: 1800, category: "boards", rating: 4.5, reviews: 5, stock: 6,
    desc: "DX series replacement control board." },

  /* ------------------------- CENTURION REMOTES / RX ------------------------- */
  { id: "ct-remote1", brand: "CENTURION", name: "NOVA One-Button Remote", price: 250, category: "remotes", rating: 4.7, reviews: 55, stock: 60,
    desc: "Single-button rolling-code remote for one gate or device." },
  { id: "ct-remote2", brand: "CENTURION", name: "NOVA Two-Button Remote", price: 300, category: "remotes", rating: 4.7, reviews: 48, stock: 55,
    desc: "Two-button rolling-code remote to control a gate plus a second device." },
  { id: "ct-remote4", brand: "CENTURION", name: "NOVA Four-Button Remote", price: 350, category: "remotes", rating: 4.8, reviews: 61, stock: 50, badge: "Popular",
    desc: "Four-button rolling-code remote for multiple gates and devices." },
  { id: "ct-rx1", brand: "CENTURION", name: "One-Channel Receiver", price: 450, category: "remotes", rating: 4.6, reviews: 15, stock: 24,
    desc: "Single-channel multi-user receiver for adding remote control to any operator." },

  /* ------------------------- CENTURION POWER ------------------------- */
  { id: "ct-battery", brand: "CENTURION", name: "Gate Motor Backup Battery", price: 400, category: "power", rating: 4.6, reviews: 40, stock: 40,
    desc: "Rechargeable backup battery keeps your gate operating through power cuts." },
  { id: "ct-ch-d5evo", brand: "CENTURION", name: "D5 EVO Charger", price: 1000, category: "power", rating: 4.5, reviews: 8, stock: 12,
    desc: "Replacement charger module for the D5 EVO operator." },
  { id: "ct-ch-d10std", brand: "CENTURION", name: "D10 Standard Charger", price: 1050, category: "power", rating: 4.5, reviews: 6, stock: 10,
    desc: "Standard charger for the D10 operator range." },
  { id: "ct-ch-d5evosmart", brand: "CENTURION", name: "D5 EVO Smart Charger", price: 950, category: "power", rating: 4.5, reviews: 7, stock: 11,
    desc: "Smart charger module for D5 EVO Smart operators." },
  { id: "ct-ch-d10smart", brand: "CENTURION", name: "D10 Smart Charger", price: 1050, category: "power", rating: 4.5, reviews: 5, stock: 9,
    desc: "Smart charger module for D10 Smart operators." },
  { id: "ct-ch-d6smart", brand: "CENTURION", name: "D6 Smart Charger", price: 950, category: "power", rating: 4.5, reviews: 6, stock: 10,
    desc: "Smart charger module for D6 Smart operators." },
  { id: "ct-ch-d5smart", brand: "CENTURION", name: "D5 Smart Charger", price: 650, category: "power", rating: 4.5, reviews: 5, stock: 12,
    desc: "Charger module for D5 Smart operators." },

  /* ------------------------- CENTURION ACCESSORIES ------------------------- */
  { id: "ct-steelrack", brand: "CENTURION", name: "Steel Gear Rack", price: 450, category: "accessories", rating: 4.6, reviews: 30, stock: 40,
    desc: "Durable steel gear rack for sliding gate operators — smooth, long-lasting drive." },
  { id: "ct-surge", brand: "CENTURION", name: "Surge Protector", price: 550, category: "accessories", rating: 4.7, reviews: 26, stock: 30, badge: "Protect",
    desc: "Protects your operator electronics from lightning and mains power surges." },
  { id: "ct-base6", brand: "CENTURION", name: "D6 Base Plate", price: 300, category: "accessories", rating: 4.5, reviews: 8, stock: 25,
    desc: "Mounting base plate for D6 operators." },
  { id: "ct-base10", brand: "CENTURION", name: "D10 Base Plate", price: 350, category: "accessories", rating: 4.5, reviews: 6, stock: 22,
    desc: "Mounting base plate for D10 operators." },
  { id: "ct-vantagearm", brand: "CENTURION", name: "Vantage Arm", price: 4750, category: "accessories", rating: 4.7, reviews: 5, stock: 5,
    desc: "Articulated arm assembly for Vantage swing gate operators." },
  { id: "ct-vantagectrl", brand: "CENTURION", name: "Vantage Controller", price: 2750, category: "accessories", rating: 4.7, reviews: 4, stock: 5,
    desc: "Controller unit for Vantage swing gate systems." },
];

/* --------------------- real product imagery --------------------- */
/* Photos extracted from the NEMTEK banner + genuine CENTURION product
   shots, stored in /public/products. Mapped per product id with sensible
   fallbacks by category. */
const IMG = (f: string) => `/products/${f}.jpg`;

const IMAGE_MAP: Record<string, string> = {
  // NEMTEK — energizers
  "nt-merlin4": "img-energizer", "nt-merlin2j": "img-energizer", "nt-stealth": "img-energizer",
  "nt-druid13": "img-energizer2", "nt-merlin4i-pcb": "ct-board",
  // NEMTEK — keypad / power
  "nt-keypad1": "ct-keypad", "nt-battery": "ct-battery", "nt-charger": "ct-charger", "nt-w2m2m4": "img-energizer2",
  // NEMTEK — wire & cable
  "nt-ss-1mm": "img-wire", "nt-ss-12mm": "img-wire", "nt-ht-slim": "img-cable",
  "nt-ht-4core": "img-cable", "nt-comms-4": "img-cable", "nt-comms-6": "img-cable",
  // NEMTEK — lighting & alarm
  "nt-fencelight": "img-alarm", "nt-strobe": "img-alarm", "nt-siren15": "img-siren", "nt-sirenbig": "img-siren",
  // NEMTEK — gate contacts
  "nt-sgc-std": "img-strainer", "nt-sgc-inline": "img-strainer", "nt-sgc-bracket": "img-insulator",
  // NEMTEK — remotes
  "nt-sherlo-rx2": "ct-receiver", "nt-sherlo-tx2": "ct-remote",
  // NEMTEK — signage
  "nt-warnsign": "img-sign",
  // NEMTEK — accessories
  "nt-ferr-cu": "img-insulator", "nt-ferr-al": "img-insulator", "nt-bobbins": "img-insulator",
  "nt-springhook": "img-insulator", "nt-compspring": "img-insulator", "nt-compspring-blk": "img-insulator",
  "nt-nailanchor": "img-insulator", "nt-inlineloop": "img-insulator",
  "nt-staylug-600": "img-insulator", "nt-staylug-750": "img-insulator",
  "nt-tension-str": "img-strainer", "nt-tension-al": "img-strainer",

  // CENTURION — gate motors
  "ct-d5evo": "ct-d5evo", "ct-d6": "ct-d6", "ct-d10": "ct-d10", "ct-d10turbo": "ct-d10",
  "ct-vantage": "ct-vantage", "ct-d3": "ct-d3", "ct-d4": "ct-d5evo", "ct-d2kit": "ct-d3", "ct-d20kit": "ct-d20",
  "ct-d6op": "ct-d6", "ct-d5evoop": "ct-d5evo", "ct-d20op": "ct-d20", "ct-d20splus-op": "ct-d20",
  "ct-d10t-op": "ct-d10", "ct-d10splus-op": "ct-d10", "ct-d4op": "ct-d5evo", "ct-d3op": "ct-d3",
  // CENTURION — access control
  "ct-gspeak": "ct-intercom", "ct-gswitch": "ct-gswitch", "ct-smartguard": "ct-keypad",
  "ct-smartguardair": "ct-keypad", "ct-sdo5": "ct-d5evo", "ct-i5v3": "ct-photon",
  "ct-photon": "ct-photon", "ct-photonsmart": "ct-photonsmart",
  // CENTURION — boards
  "ct-d5evoboard": "ct-board", "ct-d10board": "ct-board", "ct-dxboard": "ct-vboard",
  // CENTURION — remotes
  "ct-remote1": "ct-remote", "ct-remote2": "ct-remote", "ct-remote4": "ct-remote", "ct-rx1": "ct-receiver",
  // CENTURION — power
  "ct-battery": "ct-battery", "ct-ch-d5evo": "ct-charger", "ct-ch-d10std": "ct-chargercard",
  "ct-ch-d5evosmart": "ct-charger", "ct-ch-d10smart": "ct-chargercard", "ct-ch-d6smart": "ct-charger",
  "ct-ch-d5smart": "ct-chargercard",
  // CENTURION — accessories
  "ct-steelrack": "ct-rack", "ct-surge": "ct-chargercard", "ct-base6": "ct-rack", "ct-base10": "ct-rack",
  "ct-vantagearm": "ct-vantage", "ct-vantagectrl": "ct-vboard",
};

const CATEGORY_FALLBACK: Record<CategoryKey, string> = {
  energizers: "img-energizer", keypads: "ct-keypad", "wire-cable": "img-wire",
  "gate-motors": "ct-d5evo", "access-control": "ct-intercom", boards: "ct-board",
  remotes: "ct-remote", power: "ct-charger", "lighting-alarm": "img-siren",
  "gate-contacts": "img-strainer", signage: "img-sign", accessories: "img-insulator",
};

export function imageFor(product: { id: string; category: CategoryKey }): string {
  const file = IMAGE_MAP[product.id] ?? CATEGORY_FALLBACK[product.category] ?? "img-insulator";
  return IMG(file);
}

/* deterministic "market price" so we can show a stable discount %, Jumia-style */
export function pricing(product: Product) {
  const seed = product.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pct = 8 + (seed % 23); // 8% – 30% off
  const old = Math.round((product.price / (1 - pct / 100)) / 5) * 5;
  return { price: product.price, oldPrice: old, discount: pct };
}

/* ----------------------------- helpers ----------------------------- */
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

export const formatPrice = (n: number) =>
  "GH₵ " +
  n.toLocaleString("en-GH", {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });

export const categoryList = (Object.keys(CATEGORIES) as CategoryKey[]).map((k) => ({
  key: k,
  ...CATEGORIES[k],
  count: PRODUCTS.filter((p) => p.category === k).length,
}));
