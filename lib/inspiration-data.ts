export type InspirationSettings = {
  prompt: string
  length: number
  seed: number
  enhancePrompt: boolean
}

export type InspirationItem = InspirationSettings & {
  image: string
  title: string
  enhancedPromptText?: string
}

export const inspirationData: InspirationItem[] = [
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_2_galatic_explorer-5MyNMWdZ9M2ztarfRZ5H7xibeHurbS.webp",
    prompt: "A sleek spacecraft flying through vibrant orange clouds in space, with detailed metallic textures and dramatic lighting",
    title: "Galactic Explorer",
    length: 10,
    seed: 12345,
    enhancePrompt: true,
    enhancedPromptText: "A futuristic spacecraft with sleek, aerodynamic design soars through a cosmic landscape of swirling, luminous orange nebulae. The ship's metallic hull gleams with intricate, high-tech textures, reflecting the warm hues of the surrounding gas clouds. Dramatic lighting casts long shadows across the vessel's surface, emphasizing its curves and edges. Stars twinkle in the background, creating a sense of vast, unexplored space."
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_4_urban_life-TKTftWal1CqS7nOiLxPTw2D58x4Per.webp",
    prompt: "Post-apocalyptic cityscape with overgrown buildings covered in vegetation, deer grazing in an urban meadow",
    title: "Urban Nature",
    length: 5,
    seed: 67890,
    enhancePrompt: false
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_1_cyberpunk_neon_street-GdkZ9H8Lu7PSGutaiZxnX6gHE2a9r6.webp",
    prompt: "Cyberpunk night scene in a Japanese city street with neon signs and wet reflective streets",
    title: "Neon Streets",
    length: 10,
    seed: 24680,
    enhancePrompt: true,
    enhancedPromptText: "A bustling cyberpunk cityscape at night in a futuristic Tokyo. Towering skyscrapers adorned with holographic advertisements and vibrant neon signs illuminate the scene. The rain-slicked streets below act as mirrors, creating a dazzling display of reflected lights. Crowds of diverse individuals, some with cybernetic enhancements, navigate the neon-lit sidewalks. Flying cars and drones weave between buildings, their lights streaking across the sky."
  },
  {
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image_3_samurai-zoSEbfvoVb0fkaEptdgShcG0oK4Qhk.webp",
    prompt: "Samurai warrior standing on a cliff with Mount Fuji and cherry blossoms during sunset, anime art style",
    title: "Sakura Warrior",
    length: 5,
    seed: 13579,
    enhancePrompt: false
  }
]

