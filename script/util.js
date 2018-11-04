export let config = {
    minArcLength: 35,
    arcDepth: 30,
    arcWidth: 25,
    startAngle: 3 / 2 * Math.PI,
    anchorOffset: 50,
    anchorSize: 100,

    showSteps: false
};

export function rgb2hsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    let H, S, V;

    if (max === min) H = 0;
    else if (max === r) H = ((g - b) / (max - min)) * 180 / 6;
    else if (max === g) H = (2 + (b - r) / (max - min)) * 180 / 6;
    else if (max === b) H = (4 + (b - r) / (max - min)) * 180 / 6;

    if (H < 0) H += 180;

    if (max === 0) S = 0;
    else S = 255 * (max - min) / max;

    V = 255 * max;

    return {
        h: H,
        s: S,
        v: V
    };
}

export function rotate90(src, dest) {
    cv.transpose(src, dest);
    cv.flip(src, dest, 1);
}

export function rotate180(src, dest) {
    cv.flip(src, dest, -1);
}

export function rotate270(src, dest) {
    cv.transpose(src, dest);
    cv.flip(src, dest, 0);
}

export function arcRadius(layer) {
    return layer === 0 ? (config.arcWidth) : (config.arcDepth * layer + config.arcWidth / 2);
}

export function innerArcLength(layer) {
    const depth = layer * config.arcDepth;
    const innerDepth = depth - config.arcWidth / 2;
    return 2 * Math.PI * innerDepth;
}

export function layers(bits, bitsPerSegment) {
    let s = Math.ceil(bits / bitsPerSegment);
    let layer = 1;
    while (s > 0) {
        const wedges = segments(layer);
        s -= wedges;
        layer++;
    }
    return layer;
}

export function segments(layer) {
    // const ideal = innerArcLength(layer) / minArcLength;
    // return Math.ceil(ideal);
    switch (layer) {
        case 1:
        case 2:
            return 8;
        case 3:
        case 4:
        case 5:
            return 16;
        default:
            return 32;
    }
}

export function getBit(bytes, index) {
    if (index > bytes.length * 8) return 0;
    const byte = bytes[bytes.length - 1 - Math.floor(index / 8)];
    return (byte >> (index % 8)) & 1;
}