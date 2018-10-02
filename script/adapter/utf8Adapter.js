export default class Utf8Adapter {

    isValid() {
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

}