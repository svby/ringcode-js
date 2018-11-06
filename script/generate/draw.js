import * as util from '../util.js'

export default function draw(bytes, generator) {
    const pageCanvas = document.getElementById("canvas");
    const pageCtx = pageCanvas.getContext("2d");

    pageCtx.fillStyle = generator.backgroundColor || "#FFFFFF";
    pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    const size = bytes ? bytes.length : 0;

    const canvas = document.createElement("canvas");

    const layers = bytes ? generator.getLayers(bytes.length * 8) : 1;
    const radius = util.arcRadius(Math.max(layers, 5));

    canvas.width = canvas.height = radius * 2;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = generator.backgroundColor || "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    generator.drawAnchor(canvas, ctx);

    if (bytes) {
        ctx.moveTo(0, 0);

        ctx.lineWidth = util.config.arcWidth;
        ctx.fillStyle = ctx.strokeStyle = "#000000";

        generator.generate(bytes, canvas, ctx);
    }

    pageCtx.drawImage(canvas, util.config.anchorOffset, util.config.anchorOffset,
        pageCanvas.width - util.config.anchorOffset * 2, pageCanvas.height - util.config.anchorOffset * 2);

    // Draw anchor
    pageCtx.beginPath();
    const anchorOffset = util.config.anchorOffset;
    const anchorLength = util.config.anchorSize;
    pageCtx.lineTo(anchorOffset, anchorOffset);
    pageCtx.lineTo(anchorOffset + anchorLength, anchorOffset);
    pageCtx.lineTo(anchorOffset, anchorOffset + anchorLength);
    pageCtx.fillStyle = generator.foregroundTextColor || "#000000";
    pageCtx.fill();

    {
        let idx = 0;
        for (const color of generator.colors) {
            if (color === "#FFFFFF" || color === "#000000") continue;
            pageCtx.fillStyle = color;
            switch (idx) {
                case 0:
                    pageCtx.fillRect(pageCanvas.width - util.config.anchorOffset - util.config.keySize, pageCanvas.height - util.config.anchorOffset - util.config.keySize, util.config.keySize, util.config.keySize);
                    break;
                case 1:
                    pageCtx.fillRect(pageCanvas.width - util.config.anchorOffset - util.config.keySize, pageCanvas.height - util.config.anchorOffset - util.config.keySize - util.config.keySize, util.config.keySize, util.config.keySize);
                    break;
                case 2:
                    pageCtx.fillRect(pageCanvas.width - util.config.anchorOffset - util.config.keySize - util.config.keySize, pageCanvas.height - util.config.anchorOffset - util.config.keySize, util.config.keySize, util.config.keySize);
                    break;
            }
            ++idx;
        }
    }

    pageCtx.fillStyle = generator.foregroundTextColor || "#000000";
    pageCtx.fillText(size === 1 ? "1 byte" : `${size} bytes`, 5, pageCanvas.height - 5);
}