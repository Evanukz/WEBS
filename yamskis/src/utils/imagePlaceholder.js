export default function placeholderImage(label = 'Product', width = 900, height = 900) {
  const bg = '#f1f5f9';
  const fg = '#0f172a';
  const text = String(label).slice(0, 30);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="${bg}"/>
    <text x="50%" y="45%" font-family="Inter, Arial, sans-serif" font-size="44" text-anchor="middle" fill="${fg}">${text}</text>
    <text x="50%" y="62%" font-family="Inter, Arial, sans-serif" font-size="24" text-anchor="middle" fill="${fg}">Yamskis</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
