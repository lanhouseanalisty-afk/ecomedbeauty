/**
 * AI Image Service
 * Simulates AI image generation by returning high-quality URLs based on keywords.
 */

const THEME_IDS = {
    estetica: [
        "1522335789203-aabd1fc54bc9", // Skin care
        "1616683693504-3ea7e9ad6fec", // Cosmetic lab
        "1559839734-2b71f153675f", // Doctor
        "1612349317150-e413f6a5b16d", // Aesthetic doctor
        "1596755091770-8e26f183795c"  // Beauty bottle
    ],
    laboratorio: [
        "1581093588401-fbb62a02f120", // Microscope
        "1579154204601-01588f351e67", // Scientist
        "1532187863486-abf317937397", // Lab tools
        "1582719508461-905c673771fd"  // Test tubes
    ],
    luxo: [
        "1544161515-436cefb5471d", // Spa
        "1560750588-73207b1ef5b8", // Minimalist interior
        "1553531384-cc64ac80f931", // Luxury products
        "1519710164239-da123dc03ef4"  // Elegant background
    ],
    tecnologia: [
        "1518770660439-4636190af475", // Circuit
        "1485827404703-89b55fcc595e", // Robotics
        "1451187580459-43490279c0fa", // Global network
        "1550751827-4bd374c3f58b"   // Cyber security tech
    ]
};

export const aiImageService = {
    /**
     * "Generates" an image based on a prompt.
     * In this implementation, it extracts keywords and uses a curated list of high-res images.
     */
    async generateImage(prompt: string): Promise<string> {
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 1500));

        const lowerPrompt = prompt.toLowerCase();
        let currentTheme: keyof typeof THEME_IDS = "estetica";

        // Simple keyword extraction
        if (lowerPrompt.includes("lab") || lowerPrompt.includes("ciência") || lowerPrompt.includes("pesquisa") || lowerPrompt.includes("químico")) {
            currentTheme = "laboratorio";
        } else if (lowerPrompt.includes("luxo") || lowerPrompt.includes("elegante") || lowerPrompt.includes("premium") || lowerPrompt.includes("dourado")) {
            currentTheme = "luxo";
        } else if (lowerPrompt.includes("tech") || lowerPrompt.includes("inovação") || lowerPrompt.includes("futuro") || lowerPrompt.includes("digital")) {
            currentTheme = "tecnologia";
        } else if (lowerPrompt.includes("pele") || lowerPrompt.includes("rosto") || lowerPrompt.includes("procedimento") || lowerPrompt.includes("clínica")) {
            currentTheme = "estetica";
        }

        const ids = THEME_IDS[currentTheme];
        const photoId = ids[Math.floor(Math.random() * ids.length)];

        // Return a high-quality Unsplash image with the real ID
        return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=2000`;
    }
};
