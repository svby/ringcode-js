import * as util from '../../util.js'

const color1 = "#00FFFF";
const color3 = "#FFFF00";
const color2 = "#FF00FF";
const color4 = "#000000";

export default class CmyGenerator {

    get name() {
        return "cmy";
    }

    get colors() {
        return [color1, color2, color3, color4];
    }

    get foregroundTextColor() {
        return "#FFFFFF";
    }

    get backgroundColor() {
        return "#000000";
    }

    getLayers(bits) {
        return util.layers(bits, 2);
    }

    drawAnchor(canvas, ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.foregroundTextColor;
        ctx.lineWidth = 1;
        ctx.arc(canvas.width / 2, canvas.height / 2, util.arcRadius(0), 0, 2 * Math.PI);
        ctx.fill();
    }

    generate(data, canvas, ctx) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        let layer = 1;
        let segment = 0;
        let total = util.segments(layer);

        for (let bit = 0; bit < data.length * 8; bit += 2) {
            const interval = 2 * Math.PI / total;
            const bits = [util.getBit(data, bit), util.getBit(data, bit + 1)];

            let color;
            if (bits[0] === 1 && bits[1] === 1) {
                color = color1;
            } else if (bits[0] === 0 && bits[1] === 1) {
                color = color2;
            } else if (bits[0] === 1 && bits[1] === 0) {
                color = color3;
            } else if (bits[0] === 0 && bits[1] === 0) {
                //color = "#FFFFFF";
            }
            if (typeof color !== "undefined") {
                ctx.strokeStyle = color;
                ctx.lineWidth = util.config.arcWidth;
                ctx.beginPath();
                ctx.arc(centerX, centerY, util.arcRadius(layer), util.config.startAngle + segment * interval, util.config.startAngle + (segment + 1) * interval);
                ctx.stroke();
            }
            segment++;
            if (segment === total) {
                layer++;
                segment = 0;
                total = util.segments(layer);
            }

            // ctx.beginPath();
            // ctx.strokeStyle = "#FFFFFF";
            // const w = 10;
            // ctx.lineWidth = w;
            // ctx.arc(centerX, centerY, util.arcRadius(top-1) + util.config.arcWidth/2+w/2, 0, 2*Math.PI);
            // ctx.stroke();
        }
    }

}