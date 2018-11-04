import * as util from "../../util.js";

export default class CmyReader {

    get name() {
        return "cmy";
    }

    process(buffer, r, g, b) {
        const hsv = util.rgb2hsv(r, g, b);

        if (hsv.h >= 145 && hsv.h <= 155 && hsv.v >= 180) {
            buffer.push(0);
            buffer.push(1);
        } else if (hsv.h >= 85 && hsv.h <= 95 && hsv.v >= 180) {
            buffer.push(1);
            buffer.push(1);
        } else if (hsv.h >= 25 && hsv.h <= 35 && hsv.v >= 180) {
            buffer.push(1);
            buffer.push(0);
        } else {
            buffer.push(0);
            buffer.push(0);
        }
    }

}