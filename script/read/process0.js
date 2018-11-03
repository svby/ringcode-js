import * as util from "../util.js";
import Utf8Adapter from "../adapter/utf8Adapter.js";

function colorAt(mat, x, y) {
    const ptr = mat.ucharPtr(y, x);
    return [ptr[0], ptr[1], ptr[2]];
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
    console.log(colorAt(img, centerAnchor.x, centerAnchor.y - 40));

    let buffer = [];

    let copy = img.clone();
    console.log(copy.type());

    const scale = (centerAnchor.radius) / util.arcRadius(0);
    console.log(scale);

    for (let layer = 1; layer <= 8; ++layer) {
        const radius = util.arcRadius(layer) * scale;
        console.log(radius);
        const segments = util.segments(layer);

        const segmentDelta = 2 * Math.PI / segments;

        for (let segment = 0; segment < segments; ++segment) {
            const angle = segmentDelta * segment + (segmentDelta / 2);

            const x = Math.round(Math.sin(angle) * radius);
            const y = Math.round(Math.cos(angle) * radius);

            const color = colorAt(copy, centerAnchor.x + x, centerAnchor.y - y);
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