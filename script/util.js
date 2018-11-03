export let config = {
    minArcLength: 35,
    arcDepth: 35,
    arcWidth: 30,
    startAngle: 3 / 2 * Math.PI
};

export function arcRadius(layer) {
    return config.arcDepth * layer - 5;
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