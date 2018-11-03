import detectSquare from "./detectSquare.js";
import Utf8Adapter from "../adapter/utf8Adapter.js";

function process(source) {
    display(source);

    let image;

    image = cv.imread(source);

    let bgr = new cv.Mat;
    cv.cvtColor(image, bgr, cv.COLOR_BGRA2BGR);
    const res = detectSquare(bgr, display);
    console.log(res);

    const data = document.getElementById("data");
    data.value = new Utf8Adapter().decode(res);

    // gray = cv.Mat.zeros(image.rows, image.cols, cv.CV_8U);
    //
    // cv.cvtColor(image, gray, cv.COLOR_BGR2GRAY, 0);
    // // TODO blur
    // // cv.GaussianBlur();
    // cv.GaussianBlur(gray, gray, new cv.Size(3, 3), 0);
    // cv.Canny(gray, gray, 75, 255);
    //
    // let contours = new cv.MatVector;
    // let hierarchy = new cv.Mat;
    //
    // blank = cv.Mat.zeros(image.rows, image.cols, cv.CV_8UC3);
    // contourImage = image.clone();
    // cv.cvtColor(contourImage, contourImage, cv.COLOR_BGRA2BGR);
    //
    // cv.findContours(gray, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_NONE);
    //
    // for (let i = 0; i < contours.size(); ++i) {
    //     cv.drawContours(blank, contours, i, new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
    //         Math.round(Math.random() * 255), 255), 1, cv.LINE_AA, hierarchy, 100);
    // }
    //
    // // TODO process
    // contours.delete();
    // hierarchy.delete();

    // display(features);

    image.delete();
}

function matToCanvas(mat) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    cv.imshow(canvas, mat);

    return canvas;
}

function display(source) {
    let image;

    if (source instanceof Image) image = source;
    else if (source instanceof ImageData) {
        const temp = document.createElement("canvas");
        temp.width = source.width;
        temp.height = source.height;
        temp.putImageData(source);
        image = temp;
    } else image = matToCanvas(source);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const width = canvas.width, height = canvas.height;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    const scale = Math.min(height / image.height, width / image.width);

    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;

    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;

    ctx.drawImage(image, x, y, scaledWidth, scaledHeight)
}

function loadImage(data, callback) {
    const image = new Image;

    image.addEventListener("load", function () {
        callback(image);
    });

    image.src = data;
}

function setImage() {
    const uploader = document.getElementById("upload");
    const fileName = document.getElementById("upload-name");

    const file = uploader.files[0];

    fileName.innerHTML = file.name;

    let reader = new FileReader();
    reader.addEventListener("load", () => {
        loadImage(reader.result, (image) => process(image))
    });

    if (file) reader.readAsDataURL(file);
}

function init() {
    const uploader = document.getElementById("upload");
    uploader.addEventListener("change", setImage);
}

const cvScript = document.getElementById("cv");
cvScript.addEventListener("load", () => {
    init();
});