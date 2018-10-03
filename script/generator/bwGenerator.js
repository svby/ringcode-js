import * as util from '../util.js'

export default class BwGenerator {

    get foregroundTextColor() {
        return "#000000";
    }

    get backgroundColor() {
        return null;
    }

    generate(data, canvas, ctx) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.lineWidth = util.config.arcWidth;

        let layer = 1;
        let segment = 0;
        let total = util.segments(layer);

        for (let bit = 0; bit < data.length * 8; bit++) {
            const interval = 2 * Math.PI / total;
            const value = util.getBit(data, bit);
            if (value === 1) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, util.arcRadius(layer),
                    util.config.startAngle + segment * interval,
                    util.config.startAngle + (segment + 1) * interval,
                    false);
                ctx.stroke();
            } else {
                // TODO
            }
            segment++;
            if (segment === total) {
                layer++;
                segment = 0;
                total = util.segments(layer);
            }
        }
    }

}