export default class CmyReader {

    get name() {
        return "cmy";
    }

    process(buffer, r, g, b) {
        if (r === 255 && g === 255) {
            buffer.push(1);
            buffer.push(0);
        } else if (r === 255 && b === 255) {
            buffer.push(0);
            buffer.push(1);
        } else if (g === 255 && b === 255) {
            buffer.push(1);
            buffer.push(1);
        } else if (r === 0 && g === 0 && b === 0) {
            buffer.push(0);
            buffer.push(0);
        }
    }

}