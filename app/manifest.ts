import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clube Aphrodite",
    short_name: "Aphrodite",
    description: "Comunidade do Clube Aphrodite — Sintonia Equina.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5ECDA",
    theme_color: "#5C1F33",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
