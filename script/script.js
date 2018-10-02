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

let bytes;

function run() {
    const select = document.getElementById("method");
    const value = select.value;
    const method = methods[value];
    if (!method) {
        console.error(`Generator ${value} not found`);
        return;
    }
    generate(bytes, method);
}

function dataChanged(data) {
    const rawData = document.getElementById("raw");
    const dataArea = document.getElementById("data");
    const type = document.getElementById("type");
    console.log("Data changed, encoding new value");

    const adapter = adapters[type.value];
    if (!adapter) {
        console.error(`Adapter for type ${type.value} not found`);
        return;
    }

    const errorP = document.getElementById("invalidData");
    if (!data) {
        errorP.classList.add("is-hidden");
        dataArea.classList.remove("is-danger");
        bytes = null;
        rawData.value = null;
    } else if (adapter.isValid(data)) {
        errorP.classList.add("is-hidden");
        dataArea.classList.remove("is-danger");

        bytes = adapter.encode(data);
        rawData.value = adapters["hex"].decode(bytes);
    } else {
        errorP.classList.remove("is-hidden");
        dataArea.classList.add("is-danger");
        bytes = null;
        rawData.value = null;
    }
}

function typeChanged(type) {
    const data = document.getElementById("data");
    const rawData = document.getElementById("raw");
    if (typeof bytes !== "undefined" && bytes !== null && bytes.length !== 0) {
        console.log(`Type changed to ${type}, decoding bytes to new type`);
        const adapter = adapters[type];

        if (!adapter) {
            console.error(`Adapter for type ${type.value} not found`);
            return;
        }
        data.value = adapter.decode(bytes);
        rawData.value = adapters["hex"].decode(bytes);
    }

    dataChanged(data.value);
}

function init() {
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