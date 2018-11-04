import * as util from "../util.js";
import Utf8Adapter from "../adapter/utf8Adapter.js";

function color0At(mat, x, y) {
    const ptr = mat.ucharPtr(y, x);
    return ptr[0];
}

function color1At(mat, x, y) {
    const ptr = mat.ucharPtr(y, x);
    return ptr[1];
}

function color2At(mat, x, y) {
    const ptr = mat.ucharPtr(y, x);
    return ptr[2];
}

function colorAt(mat, x, y) {
    return [color0At(mat, x, y), color1At(mat, x, y), color2At(mat, x, y)];
}

function avgColor(mat, x, y) {
    const sum0 = color0At(mat, x, y) + color0At(mat, x + 1, y) + color0At(mat, x - 1, y) + color0At(mat, x, y + 1) + color0At(mat, x, y - 1);
    const sum1 = color1At(mat, x, y) + color1At(mat, x + 1, y) + color1At(mat, x - 1, y) + color1At(mat, x, y + 1) + color1At(mat, x, y - 1);
    const sum2 = color2At(mat, x, y) + color2At(mat, x + 1, y) + color2At(mat, x - 1, y) + color2At(mat, x, y + 1) + color2At(mat, x, y - 1);
    return [sum0 / 5, sum1 / 5, sum2 / 5];
}

function colorDistance(h1, s1, v1, h2, s2, v2) {
    const hd = h2 - h1;
    const sd = s2 - s1;
    const vd = v2 - v1;
    const number = Math.sqrt(hd * hd + sd * sd + vd * vd);
    return Math.min(number, 180 - number);
}

function decodeTo(buf, r, g, b) {
    // TODO color range
    if (r === 255 && g === 255) {
        buf.push(1);
        buf.push(0);
    } else if (r === 255 && b === 255) {
        buf.push(0);
        buf.push(1);
    } else if (g === 255 && b === 255) {
        buf.push(1);
        buf.push(1);
    } else if (r === 0 && g === 0 && b === 0) {
        buf.push(0);
        buf.push(0);
    }
    // const distCyan = colorDistance(h, s, v, 90, 255, 255);
}

export default function process0(img, centerAnchor, display) {
    let buffer = [];

    let copy = img.clone();

    const scale = (centerAnchor.radius) / util.arcRadius(0);
    console.log(`Tag scale: ${scale}`);

    for (let layer = 1; layer <= 8; ++layer) {
        const radius = util.arcRadius(layer) * scale;
        const segments = util.segments(layer);

        const segmentDelta = 2 * Math.PI / segments;

        for (let segment = 0; segment < segments; ++segment) {
            const angle = segmentDelta * segment + (segmentDelta / 2);

            const x = Math.round(Math.sin(angle) * radius);
            const y = Math.round(Math.cos(angle) * radius);

            const color = avgColor(copy, centerAnchor.x + x, centerAnchor.y - y);
            // console.log(`value at segment ${segment} (${x}, ${y}) is ${color}`);

            cv.circle(copy, new cv.Point(centerAnchor.x + x, centerAnchor.y - y), 2, new cv.Scalar(255, 0, 0));

            decodeTo(buffer, color[0], color[1], color[2]);
        }
    }

    display(copy);

    while (buffer.length !== 0 && buffer[buffer.length - 1] === 0) buffer.pop();
    buffer.reverse();

    let bits = new Uint8Array(Math.ceil(buffer.length / 8));

    for (let i = 0; i < buffer.length; ++i) {
        if (buffer[buffer.length - 1 - i] === 1) {
            bits[bits.length - 1 - Math.floor(i / 8)] |= (1 << i % 8);
        }
    }

    return bits;
}