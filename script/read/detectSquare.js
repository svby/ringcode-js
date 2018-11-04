import preprocessSquare from "./preprocessSquare.js";

export default function detectSquare(img, log, display) {
    // TODO

    log("read", "Detected square");

    let copy = new cv.Mat;
    cv.resize(img, copy, new cv.Size(550, 550));

    const result = preprocessSquare(copy, log, display);

    copy.delete();

    return result;
}