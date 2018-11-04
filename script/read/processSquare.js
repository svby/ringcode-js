// TODO delete this

export default function processSquare(image, display) {
    let copy;
    let contourImage;

    copy = image.clone();
    cv.cvtColor(copy, copy, cv.COLOR_BGR2GRAY);

    cv.blur(copy, copy, new cv.Size(2, 2));

    let kernel;
    kernel = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.dilate(copy, copy, kernel, new cv.Point(-1, -1), 1, cv.BORDER_CONSTANT);
    kernel.delete();

    cv.Canny(copy, copy, 0, 255);

    let contours = new cv.MatVector;
    let hierarchy = new cv.Mat;

    // kernel = cv.Mat.ones(3,3, cv.CV_8U);
    // cv.erode(copy, copy, kernel, new cv.Point(-1,-1), 1, cv.BORDER_CONSTANT);
    // kernel.delete();

    contourImage = cv.Mat.zeros(image.size(), image.type()); // image.clone();
    cv.findContours(copy, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.size(); ++i) {
        cv.drawContours(contourImage, contours, i, new cv.Scalar(255, 255, 255), 1, cv.LINE_AA, hierarchy, 100);
    }

    display(contourImage);

    contours.delete();
    hierarchy.delete();

    copy.delete();
    contourImage.delete();
}