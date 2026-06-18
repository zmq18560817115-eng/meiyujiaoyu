const STAMP_LABEL: Record<string, string> = {
  butterfly: "蝶",
  cloud: "云",
  huiwen: "纹",
  waves: "水",
  lotus: "莲",
  sun: "日",
  fish: "鱼",
  phoenix: "燕",
};

export type ExportStamp = {
  code: string;
  x: number;
  y: number;
  size?: number;
};

export async function exportArtworkToPng(
  svgElement: SVGSVGElement,
  stamps: ExportStamp[] = [],
  size = 600,
): Promise<string> {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(size));
  clone.setAttribute("height", String(size));
  clone
    .querySelectorAll("[onclick]")
    .forEach((el) => el.removeAttribute("onclick"));
  clone
    .querySelectorAll('[class*="cursor"]')
    .forEach((el) => el.removeAttribute("class"));

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = svgUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建画布");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  URL.revokeObjectURL(svgUrl);

  for (const stamp of stamps) {
    const stampSize = stamp.size || 48;
    const px = (stamp.x / 100) * size;
    const py = (stamp.y / 100) * size;
    const fontSize = stampSize * 0.45;

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, stampSize / 2 + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fill();
    ctx.strokeStyle = "#3b2e0b";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(STAMP_LABEL[stamp.code] || "印", px, py);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}
