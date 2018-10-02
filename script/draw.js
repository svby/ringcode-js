import * as util from './util.js'

export default function draw(bytes, generator) {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = generator.backgroundColor || "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.moveTo(0, 0);

    ctx.lineWidth = util.config.arcWidth;
    ctx.fillStyle = ctx.strokeStyle = "#000000";

    generator.generate(bytes, canvas, ctx);

    ctx.fillStyle = generator.foregroundTextColor || "#000000";
    ctx.fillText(`${bytes.length} byte(s)`, 5, canvas.height - 5);
}