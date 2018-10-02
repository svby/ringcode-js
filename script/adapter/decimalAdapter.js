export default class DecimalAdapter {

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

}