const minArcLength = 35;
const arcDepth = 40;
const arcWidth = 30;
const startAngle = 3 / 2 * Math.PI;

function getBytes(string) {
    const encoder = new TextEncoder();
    return encoder.encode(string);
}

function arcRadius(layer) {
    return arcDepth * layer - 5;
}

function innerArcLength(layer) {
    const depth = layer * arcDepth;
    const innerDepth = depth - arcWidth / 2;
    return 2 * Math.PI * innerDepth;
}

function segments(layer) {
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

function capacity(layers) {
    let total = 0;
    for (let layer = 1; layer <= layers; layer++) {
        total += segments(layer);
    }
    return total;
}

function getBit(bytes, index) {
    if (index > bytes.length * 8) return 0;
    const byte = bytes[Math.floor(index / 8)];
    return (byte >> (index % 8)) & 1;
}

function byteString(bytes) {
    let s = '';
    for (let byte = 0; byte < bytes.length; byte++) {
        console.log(bytes[byte]);
        for (let bit = 8; bit >= 0; bit--) {
            s += ((bytes[byte] >> bit) & 1);
        }
    }
    return s;
}

function generate(bytes, method) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const data = bytes || getBytes(document.getElementById("data").value);

    console.log(byteString(data));

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.moveTo(0, 0);

    ctx.lineWidth = arcWidth;
    ctx.fillStyle = ctx.strokeStyle = "#000000";

    method(data, canvas, ctx);

    ctx.fillText(`${data.length} byte(s)`, 5, canvas.height - 5);
}