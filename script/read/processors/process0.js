import * as util from "../../util.js";

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
    const ptr = mat.ucharPtr(y, x);
    return [ptr[0], ptr[1], ptr[2]];
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

export default function process0(reader) {
    return function (image, centerAnchor, cornerAnchor, config) {
        config.log();
        config.log("p0", "Using ring processor process0");
        config.log("p0", `Using reader ${reader.name}`);

        let buffer = [];

        let copy = image.clone();
        cv.GaussianBlur(copy, copy, new cv.Size(7, 7), 2, 2);

        const scale = (centerAnchor.radius) / util.arcRadius(0);
        config.log("p0", `Tag scale: ${scale}`);

        for (let layer = 1; layer <= 200; ++layer) {
            const radius = util.arcRadius(layer) * scale;
            if (centerAnchor.x - radius <= cornerAnchor || centerAnchor.y - radius <= cornerAnchor) {
                break;
            }
            const segments = util.segments(layer);

            const segmentDelta = 2 * Math.PI / segments;

            for (let segment = 0; segment < segments; ++segment) {
                const angle = segmentDelta * segment + (segmentDelta / 2);

                const x = Math.round(Math.sin(angle) * radius);
                const y = Math.round(Math.cos(angle) * radius);

                const color2 = avgColor(copy, centerAnchor.x + x, centerAnchor.y - y);
                const converted = util.rgb2hsv(color2[0], color2[1], color2[2]);
                console.log(`${layer} ${segment} ${util.hsv(converted.h, converted.s, converted.v)}`);

                reader.process(buffer, converted.h, converted.s, converted.v);

                cv.circle(copy, new cv.Point(centerAnchor.x + x, centerAnchor.y - y), 2, new cv.Scalar(255, 0, 0));
            }
        }

        config.log("p0", "Tag decoded to bit buffer");

        config.displayStep(copy);

        while (buffer.length !== 0 && buffer[buffer.length - 1] === 0) buffer.pop();
        buffer.reverse();

        let bits = new Uint8Array(Math.ceil(buffer.length / 8));

        for (let i = 0; i < buffer.length; ++i) {
            if (buffer[buffer.length - 1 - i] === 1) {
                bits[bits.length - 1 - Math.floor(i / 8)] |= (1 << i % 8);
            }
        }

        config.log("p0", "Tag decoded to byte buffer");
        config.log("p0", "Done");

        return bits;
    }
}