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

function inRangeWrap(value, lo, hi, wrap) {
    if (lo <= hi) return value >= lo && value <= hi;
    if (lo > hi) return value >= lo && value <= wrap || value >= 0 && value <= hi;
}

function process(buffer, segments, h, s, v) {
    const key = util.segment(segments[0].h, segments[1].h, segments[2].h);

    if (inRangeWrap(h, key[0][0], key[0][1], 180) && v >= util.config.reader.vThreshold) {
        for (let bit of segments[0].bits) buffer.push(bit);
    } else if (inRangeWrap(h, key[1][0], key[1][1], 180) && v >= util.config.reader.vThreshold) {
        for (let bit of segments[1].bits) buffer.push(bit);
    } else if (inRangeWrap(h, key[2][0], key[2][1], 180) && v >= util.config.reader.vThreshold) {
        for (let bit of segments[2].bits) buffer.push(bit);
    } else {
        buffer.push(0);
        buffer.push(0);
    }
}

export default function process0g() {
    return function (image, centerAnchor, cornerAnchor, config) {
        config.log();
        config.log("p0g", "Using ring processor process0 (generic)");

        let buffer = [];

        let copy = image.clone();
        cv.GaussianBlur(copy, copy, new cv.Size(7, 7), 2, 2);

        const bottomRightTagX = image.cols - util.config.anchorOffset - (util.config.keySize / 2);
        const bottomRightTagY = image.cols - util.config.anchorOffset - (util.config.keySize / 2);

        console.log(bottomRightTagY);

        const tag0Color = avgColor(copy, bottomRightTagX, bottomRightTagY);
        const tag1Color = avgColor(copy, bottomRightTagX, bottomRightTagY - util.config.keySize);
        const tag2Color = avgColor(copy, bottomRightTagX - util.config.keySize, bottomRightTagY);

        const tag0Hsv = util.rgb2hsv(tag0Color[0], tag0Color[1], tag0Color[2]);
        const tag1Hsv = util.rgb2hsv(tag1Color[0], tag1Color[1], tag1Color[2]);
        const tag2Hsv = util.rgb2hsv(tag2Color[0], tag2Color[1], tag2Color[2]);

        config.log(`Key: ${util.hsv(tag0Hsv.h, tag0Hsv.s, tag0Hsv.v)} ${util.hsv(tag1Hsv.h, tag1Hsv.s, tag1Hsv.v)} ${util.hsv(tag2Hsv.h, tag2Hsv.s, tag2Hsv.v)}`);
        let keyParts = [{h: tag0Hsv.h, bits: [1, 1]}, {h: tag1Hsv.h, bits: [0, 1]}, {h: tag2Hsv.h, bits: [1, 0]}];
        keyParts.sort((a, b) => a.h - b.h);
        console.log(keyParts);

        const scale = (centerAnchor.radius) / util.arcRadius(0);
        config.log("p0g", `Tag scale: ${scale}`);

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

                process(buffer, keyParts, converted.h, converted.s, converted.v);

                cv.circle(copy, new cv.Point(centerAnchor.x + x, centerAnchor.y - y), 2, new cv.Scalar(255, 0, 0));
            }
        }

        config.log("p0g", "Tag decoded to bit buffer");

        config.displayStep(copy);

        while (buffer.length !== 0 && buffer[buffer.length - 1] === 0) buffer.pop();
        buffer.reverse();

        let bits = new Uint8Array(Math.ceil(buffer.length / 8));

        for (let i = 0; i < buffer.length; ++i) {
            if (buffer[buffer.length - 1 - i] === 1) {
                bits[bits.length - 1 - Math.floor(i / 8)] |= (1 << i % 8);
            }
        }

        config.log("p0g", "Tag decoded to byte buffer");
        config.log("p0g", "Done");

        return bits;
    }
}