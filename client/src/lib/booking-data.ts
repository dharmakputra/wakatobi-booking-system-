// Constants for pricing and availability
export const FLIGHT_PRICE = 900; // per person

// Accommodation options
export const accommodations = [
  {
    id: "ocean-bungalow",
    name: "Ocean Bungalow",
    pricePerNight: 490,
    description: "Spacious beachfront accommodation with stunning ocean views and easy water access.",
    features: ["Beachfront", "King or Twin Beds", "Air Conditioned"],
    image: "https://www.wakatobi.com/wp-content/uploads/2019/07/AccommodationsB-650x650.jpg"
  },
  {
    id: "palm-bungalow",
    name: "Palm Bungalow",
    pricePerNight: 420,
    description: "Secluded and peaceful accommodations set among the palms, steps from the water.",
    features: ["Garden View", "King or Twin Beds", "Air Conditioned"],
    image: "https://www.wakatobi.com/wp-content/uploads/2019/07/PalmBungalow-1024x688.jpg"
  },
  {
    id: "one-bedroom-villa",
    name: "One-Bedroom Villa",
    pricePerNight: 590,
    description: "Luxurious private villa with pool, expansive deck, and direct beach access.",
    features: ["Beachfront", "Private Pool", "Spacious Deck"],
    image: "https://www.wakatobi.com/wp-content/uploads/2019/07/VillaOne3-1000x590.jpg"
  },
  {
    id: "two-bedroom-villa",
    name: "Two-Bedroom Villa",
    pricePerNight: 690,
    description: "Ultimate luxury with two master suites, private pool, and expansive living areas.",
    features: ["Beachfront", "Private Pool", "Two Bedrooms"],
    image: "https://www.wakatobi.com/wp-content/uploads/2019/07/VillaFour6-1000x590.jpg"
  }
];

// Activity options
export const activities = [
  {
    id: "unlimited-dive",
    name: "Unlimited Dive Package",
    pricePerDay: 295,
    description: "Enjoy unlimited shore diving and up to three guided boat dives per day. Includes all equipment, guide services, and unlimited nitrox.",
    features: ["Unlimited Shore Diving", "Three Boat Dives Daily", "Equipment Included", "Nitrox Included"],
    image: "https://www.wakatobi.com/wp-content/uploads/2023/01/divers-along-reef-wall-wakatobi-1024x632.jpg"
  },
  {
    id: "snorkeling",
    name: "Snorkeling Package",
    pricePerDay: 205,
    description: "Unlimited shore snorkeling plus two guided boat snorkeling excursions daily to Wakatobi's best reefs. Includes equipment and guide services.",
    features: ["Unlimited Shore Snorkeling", "Two Guided Boat Tours Daily", "Equipment Included"],
    image: "https://www.wakatobi.com/wp-content/uploads/2023/01/Snorkelers-at-Table-Coral-City-Wakatobi-1024x682.jpg"
  },
  {
    id: "spa-relaxation",
    name: "Spa & Relaxation Package",
    pricePerDay: 150,
    description: "Indulge in daily spa treatments including massages, body treatments, and facials. Includes morning yoga sessions and healthy refreshments.",
    features: ["Daily Treatments", "Morning Yoga", "Wellness Focus"],
    image: "https://www.wakatobi.com/wp-content/uploads/2019/07/Spa-1000x590.jpg"
  },
  {
    id: "no-activity",
    name: "No Activity Package",
    pricePerDay: 0,
    description: "Enjoy your stay without a pre-selected activity package. Individual activities can be arranged during your stay at the resort.",
    features: [],
    image: undefined
  }
];

// Calculate discount based on visit count
export const getDiscountRate = (visitCount: string): number => {
  switch (visitCount) {
    case 'second-third':
      return 0.05; // 5% discount
    case 'fourth-plus':
      return 0.10; // 10% discount
    default:
      return 0; // No discount for first-time visitors
  }
};
