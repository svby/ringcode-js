import preprocessSquare from "./preprocessSquare.js";

export default function detectSquare(img, log, display) {
    // TODO

    log("read", "Detected square");
    return preprocessSquare(img, log, display);
}