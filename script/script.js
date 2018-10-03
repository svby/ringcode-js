import draw from './draw.js'
import BwGenerator from './generator/bwGenerator.js'
import CmyGenerator from './generator/cmyGenerator.js'
import BinaryAdapter from './adapter/binaryAdapter.js'
import DecimalAdapter from './adapter/decimalAdapter.js'
import HexAdapter from './adapter/hexAdapter.js'
import Utf8Adapter from './adapter/utf8Adapter.js'

const generators = Object.freeze({
    "bw": new BwGenerator(),
    "cmy": new CmyGenerator()
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
    const generator = generators[value];
    if (!generator) {
        console.error(`Generator ${value} not found`);
        return;
    }
    if (bytes) draw(bytes, generator);
}

function download() {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    let link = document.createElement("a");
    link.download = "ringcode.png";
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function dataChanged(data) {
    const rawData = document.getElementById("raw");
    const dataArea = document.getElementById("data");
    const type = document.getElementById("type");
    const auto = document.getElementById("auto");

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

    if (auto.checked) {
        // TODO workers?
        run();
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
    const method = document.getElementById("method");
    const runButton = document.getElementById("run");
    const dlButton = document.getElementById("dl");
    const auto = document.getElementById("auto");

    const listener = () => {
        dataChanged(data.value);
    };
    data.addEventListener("change", listener);
    data.addEventListener("keyup", listener);
    type.addEventListener("change", () => typeChanged(type.value));
    runButton.addEventListener("click", run);
    dlButton.addEventListener("click", download);
    method.addEventListener("change", () => {
        if (auto.checked) run();
    });
    auto.addEventListener("change", () => {
        if (auto.checked) run();
    });

    listener();
    run();
}

init();