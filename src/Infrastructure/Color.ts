
export function shadeColor(color: string, percent: number): string {
    const num = parseInt(color.slice(1), 16);
    const r = Math.min((num >> 16) + (num >> 16) * percent / 100, 255);
    const b = Math.min(((num >> 8) & 0xFF) + ((num >> 8) & 0x00FF) * percent / 100, 255);
    const g = Math.min((num & 0x0000FF) + (num & 0x0000FF) * percent / 100, 255);
    const newColor = g | (b << 8) | (r << 16);
    return "#" + newColor.toString(16);
}

export function addAlpha(color: string, alpha: number): string {
    const f = parseInt(color.slice(1), 16);
    const R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return `rgba(${R},${G},${B},${alpha}%)`;
}
