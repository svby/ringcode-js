export default class HexAdapter {

    decode(data) {
        return Array.prototype.map.call(data, x => ('00' + x.toString(16)).slice(-2))
            .join(' ').toUpperCase();
    }

}