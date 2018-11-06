import * as util from "../../util.js";

function inRangeWrap(value, lo, hi, wrap) {
    if (lo <= hi) return value >= lo && value <= hi;
    if (lo > hi) return value >= lo && value <= wrap || value >= 0 && value <= hi;
}

export default class RgbReader {

    get name() {
        return "rgb";
    }

    process(buffer, h, s, v) {
        const segments = util.segment(0, 60, 120);
        console.log(segments);

        if (inRangeWrap(h, segments[0][0], segments[0][1], 180) && v >= util.config.reader.vThreshold) {
            buffer.push(1);
            buffer.push(1);
        } else if (inRangeWrap(h, segments[1][0], segments[1][1], 180) && v >= util.config.reader.vThreshold) {
            buffer.push(0);
            buffer.push(1);
        } else if (inRangeWrap(h, segments[2][0], segments[2][1], 180) && v >= util.config.reader.vThreshold) {
            buffer.push(1);
            buffer.push(0);
        } else {
            buffer.push(0);
            buffer.push(0);
        }
    }

}