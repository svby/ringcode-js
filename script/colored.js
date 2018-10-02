const color1 = "#000000";
const color2 = "#FFFF00";
const color3 = "#FF00FF";
const color4 = "#00FFFF";

const colors = Object.freeze([
    color1, color2, color3, color4
]);

const colored = (bytes, canvas, ctx) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const data = bytes || getBytes(document.getElementById("data").value);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.moveTo(0, 0);

    let layer = 1;
    let segment = 0;
    let total = segments(layer);

    console.log(byteString(data));

    for (let bit = 0; bit < data.length * 8; bit += 2) {
        const interval = 2 * Math.PI / total;
        const bits = [getBit(data, bit), getBit(data, bit + 1)];
        console.log(bits);
        let color;
        if (bits[0] === 1 && bits[1] === 1) {
            color = color4;
        } else if (bits[0] === 0 && bits[1] === 1) {
            color = color3;
        } else if (bits[0] === 1 && bits[1] === 0) {
            color = color2;
        } else if (bits[0] === 0 && bits[1] === 0) {
        }
        if (typeof color !== "undefined") {
            ctx.strokeStyle = color;
            ctx.lineWidth = arcWidth;
            ctx.beginPath();
            ctx.arc(centerX, centerY, arcRadius(layer), startAngle + segment * interval, startAngle + (segment + 1) * interval);
            ctx.stroke();
        }
        segment++;
        if (segment === total) {
            layer++;
            segment = 0;
            total = segments(layer);
        }
    }
};