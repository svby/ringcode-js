import detectSquare from "./detectSquare.js";

const emptyData = "data:image/png;base64,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";

function process(source) {
    display(source);

    loadImage(emptyData, (empty) => {
        let features;
        let image;

        features = cv.imread(empty);
        image = cv.imread(source);

        let bgr = new cv.Mat;
        cv.cvtColor(image, bgr, cv.COLOR_BGRA2BGR);
        const res = detectSquare(bgr, display);
        console.log(res);

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

        let orb = new cv.ORB;
        let keypoints = new cv.KeyPointVector;
        let descriptors = new cv.Mat;

        orb.detect(features, keypoints);
        orb.compute(features, keypoints, descriptors);

        // display(features);

        orb.delete();
        keypoints.delete();
        descriptors.delete();

        // display(features);

        image.delete();
        features.delete();
    });
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

    let reader = new FileReader;
    reader.addEventListener("load", () => loadImage(reader.result, (image) => process(image)));

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