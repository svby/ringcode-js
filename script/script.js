const methods = Object.freeze({
    "bw": bw,
    "colored": colored
});

function run() {
    const select = document.getElementById("method");
    const value = select.value;
    const method = methods[value];
    if (typeof method === "undefined") return;
    generate(null, method);
}

let bytes;
const encoder = new TextEncoder();
const decoder = new TextDecoder("UTF-8");

function getHex(data) {
    return Array.prototype.map.call(data, x => ('00' + x.toString(16)).slice(-2))
        .join(' ').toUpperCase();
}

function dataChanged(data) {
    const rawData = document.getElementById("raw");
    const type = document.getElementById("type");
    console.log("Data changed, encoding new value");
    switch (type.value) {
        case "bin":
            bytes = encodeBinary(data);
            break;
        case "dec":
            bytes = encodeInt(data);
            break;
        case "utf8":
            bytes = encoder.encode(data);
            break;
    }

    rawData.value = getHex(bytes);
}

function encodeInt(number) {
    let big = new bigInt(number);
    const bytes = new Uint8Array(Math.ceil(big.bitLength() / 8));
    let hexString = big.toString(16);
    if (hexString.length % 2 > 0) hexString = "0" + hexString;
    let bi = 0;
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[bi++] = parseInt(hexString.slice(i, i + 2), 16);
    }

    return bytes;
}

function decodeInt() {
    let hex = Array.prototype.map.call(bytes, x => ('00' + x.toString(16)).slice(-2))
        .join('').toUpperCase();
    return new bigInt(hex, 16);
}

function encodeBinary(text) {
    console.log(text);
    const bytes = new Uint8Array(Math.ceil(text.length / 8));
    for (let i = 0; i < text.length; i++) {
        const value = text[i] === '1' ? 1 : 0;
        bytes[Math.floor(i / 8)] |= (value << (7 - i % 8));
    }
    console.log(getHex(bytes));

    return bytes;
}

function decodeBinary() {
    console.log(bytes[0].toString(2));
    return Array.prototype.map.call(bytes, (byte) => byte.toString(2)
        .padStart(8, '0')).join('');
}

function typeChanged(type) {
    const data = document.getElementById("data");
    if (typeof bytes !== "undefined" && bytes !== null && bytes.length !== 0) {
        console.log(`Type changed to ${type}, decoding bytes to new type`);
        switch (type) {
            case "bin":
                data.value = decodeBinary();
                break;
            case "dec":
                data.value = decodeInt().toString(10);
                break;
            case "utf8":
                data.value = decoder.decode(bytes);
                break;
        }
    }

    dataChanged(data.value);
}

function init() {
    const rawData = document.getElementById("raw");
    const type = document.getElementById("type");
    const data = document.getElementById("data");
    const listener = () => {
        dataChanged(data.value);
    };
    data.addEventListener("change", listener);
    data.addEventListener("keyup", listener);
    type.addEventListener("change", () => typeChanged(type.value));
    listener();
    run();
}