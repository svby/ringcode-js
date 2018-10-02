const methods = Object.freeze({
    "bw": bw,
    "colored": colored
});

const adapters = Object.freeze({
    "bin": new BinaryAdapter(),
    "hex": new HexAdapter(),
    "dec": new DecimalAdapter(),
    "utf8": new Utf8Adapter()
});

function run() {
    const select = document.getElementById("method");
    const value = select.value;
    const method = methods[value];
    if (typeof method === "undefined") return;
    generate(null, method);
}

let bytes;

function dataChanged(data) {
    const rawData = document.getElementById("raw");
    const type = document.getElementById("type");
    console.log("Data changed, encoding new value");

    const adapter = adapters[type.value];
    if (!adapter) {
        console.error(`Adapter for type ${type.value} not found`);
        return;
    }

    bytes = adapter.encode(data);

    rawData.value = adapters["hex"].decode(bytes);
}

function typeChanged(type) {
    const data = document.getElementById("data");
    if (typeof bytes !== "undefined" && bytes !== null && bytes.length !== 0) {
        console.log(`Type changed to ${type}, decoding bytes to new type`);
        const adapter = adapters[type];

        if (!adapter) {
            console.error(`Adapter for type ${type.value} not found`);
            return;
        }
        data.value = adapter.decode(bytes);
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