/** Same ink sets and HSL lightness inversion as AppColors.displayInkColor. */
export const palettes = {
    blue: ['#03223A', '#083F69', '#7DADC8'],
    pink: ['#823C44', '#D8798A', '#EAA6AE'],
    green: ['#273526', '#45624E', '#CADFB8'],
};
export function isPalette(value) {
    return Object.prototype.hasOwnProperty.call(palettes, value);
}
export function inkColor(hex, theme) {
    if (theme === 'light')
        return hex;
    const channels = [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r, g, b] = channels;
    if (r === undefined || g === undefined || b === undefined)
        return hex;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const lightness = (max + min) / 2;
    let hue = 0;
    let saturation = 0;
    if (delta !== 0) {
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
        switch (max) {
            case r:
                hue = ((g - b) / delta) % 6;
                break;
            case g:
                hue = (b - r) / delta + 2;
                break;
            default: hue = (r - g) / delta + 4;
        }
        hue = (hue * 60 + 360) % 360;
    }
    return `hsl(${hue} ${saturation * 100}% ${(1 - lightness) * 100}%)`;
}
