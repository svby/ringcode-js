export let config = {
    minArcLength: 35,
    arcDepth: 30,
    arcWidth: 25,
    startAngle: 3 / 2 * Math.PI,
    anchorOffset: 25,
    anchorSize: 100,
    keySize: 40,

    reader: {
        whiteThreshold: 100,
        vThreshold: 120,
        segmentBoundary: 1
    },

    showSteps: false
};

export function segment(h1, h2, h3) {
    const segment2Length = (h3 - h2) / 2 + (h2 - h1) / 2 - config.reader.segmentBoundary;
    const segment3Length = (180 + h1 - h3) / 2 + (h2 - h1) / 2 - config.reader.segmentBoundary;
    const segment1Length = 180 - segment2Length - segment3Length - config.reader.segmentBoundary * 3;

    return [
        [((h1 - segment1Length / 2) + 180) % 180, h1 + segment1Length / 2],
        [h2 - segment2Length / 2, h2 + segment2Length / 2],
        [h3 - segment3Length / 2, (h3 + segment3Length / 2) % 180]
    ];
}

export function hsv(h, s, v) {
    return `${h * 2}° ${s / 255 * 100}% ${v / 255 * 100}%`
}

export function rgb2hsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    let H, S, V;

    V = max;
    S = V === 0 ? 0 : (V - min) / V;
    if (max === min) H = 0;
    else if (V === r) H = 60 * (g - b) / (V - min);
    else if (V === g) H = 120 + 60 * (b - r) / (V - min);
    else if (V === b) H = 240 + 60 * (r - g) / (V - min);

    if (H < 0) H += 360;

    return {
        h: H / 2,
        s: S * 255,
        v: V * 255
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