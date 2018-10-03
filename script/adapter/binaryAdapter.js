export default class BinaryAdapter {

    isValid(text) {
        return text.match(/^[+-]?[01\s]*$/g);
    }

    encode(text) {
        let bits = [];
        let leading = true;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char.match(/^\\w$/)) continue;

            if (char === '1') {
                bits.push(1);
                leading = false;
            } else if (char === '0' && !leading) bits.push(0);
        }

        const bytes = new Uint8Array(Math.ceil(bits.length / 8));

        for (let i = 0; i < bits.length; i++) {
            let byteIndex = Math.floor(i / 8);
            let bitIndex = i % 8;
            if (bits[bits.length - 1 - i] === 1) {
                bytes[bytes.length - byteIndex - 1] |= (1 << bitIndex);
            }
        }

        return bytes;
    }

    decode(data) {
        return Array.prototype.map.call(data, (byte) => byte.toString(2)
            .padStart(8, '0')).join('');
    }

}