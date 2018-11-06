import * as util from "../../util.js";

export default class CmyReader {

    get name() {
        return "cmy";
    }

    process(buffer, h, s, v) {
        const segments = util.segment(30, 90, 150);

        if (h >= segments[0][0] && h <= segments[0][1] && v >= util.config.reader.vThreshold) {
            buffer.push(1);
            buffer.push(0);
        } else if (h >= segments[1][0] && h <= segments[1][1] && v >= util.config.reader.vThreshold) {
            buffer.push(1);
            buffer.push(1);
        } else if (h >= segments[2][0] && h <= segments[2][1] && v >= util.config.reader.vThreshold) {
            buffer.push(0);
            buffer.push(1);
        } else {
            buffer.push(0);
            buffer.push(0);
        }
    }

}