const bw = (bytes, canvas, ctx) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const data = bytes || getBytes(document.getElementById("data").value);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.moveTo(0, 0);

    ctx.lineWidth = arcWidth;

    let layer = 1;
    let segment = 0;
    let total = segments(layer);

    console.log(byteString(data));

    for (let bit = 0; bit < data.length * 8; bit++) {
        const interval = 2 * Math.PI / total;
        const value = getBit(data, bit);
        if (value === 1) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, arcRadius(layer), startAngle + segment * interval, startAngle + (segment + 1) * interval);
            ctx.stroke();
        } else {
            // TODO
        }
        segment++;
        if (segment === total) {
            layer++;
            segment = 0;
            total = segments(layer);
        }
    }
};