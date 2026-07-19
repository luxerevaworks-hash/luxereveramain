export default function manifest() {
  return {
    name: "Luxereva | Premium Jewellery",
    short_name: "Luxereva",
    description: "Premium anti-tarnish jewellery by Luxereva.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff2e9",
    theme_color: "#fff2e9",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
