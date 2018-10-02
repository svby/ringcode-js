export default class BinaryAdapter {

    isValid(text) {
        return text.match(/^[+-]?[01\s]*$/g);
    }

    encode(text) {
        const bytes = new Uint8Array(Math.ceil(text.length / 8));
        for (let i = 0; i < text.length; i++) {
            const value = text[i] === '1' ? 1 : 0;
            bytes[Math.floor(i / 8)] |= (value << (7 - i % 8));
        }

        return bytes;
    }

    decode(data) {
        return Array.prototype.map.call(data, (byte) => byte.toString(2)
            .padStart(8, '0')).join('');
    }

}