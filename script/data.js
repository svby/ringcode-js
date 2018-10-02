const Utf8Adapter = class {

    isValid(text) {
        return true;
    }

    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    encode(text) {
        return this.encoder.encode(text);
    }

    decode(data) {
        return this.decoder.decode(data);
    }

};

const DecimalAdapter = class {

    isValid(text) {
        return text.match(/^[+-]?[0-9\s]*$/g);
    }

    encode(text) {
        let big = new bigInt(text);
        const bytes = new Uint8Array(Math.ceil(big.bitLength() / 8));
        let hexString = big.toString(16);
        if (hexString.length % 2 > 0) hexString = "0" + hexString;
        let bi = 0;
        for (let i = 0; i < hexString.length; i += 2) {
            bytes[bi++] = parseInt(hexString.slice(i, i + 2), 16);
        }

        return bytes;
    }

    decode(data) {
        let hex = Array.prototype.map.call(data, x => ('00' + x.toString(16)).slice(-2))
            .join('').toUpperCase();
        return new bigInt(hex, 16);
    }

};

const BinaryAdapter = class {

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

};

const HexAdapter = class {

    decode(data) {
        return Array.prototype.map.call(data, x => ('00' + x.toString(16)).slice(-2))
            .join(' ').toUpperCase();
    }

};