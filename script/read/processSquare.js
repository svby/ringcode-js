export default function processSquare(image, display) {
    let gray;
    let copy;
    let circles;
    let white;

    copy = image.clone();
    gray = cv.Mat.zeros(image.rows, image.cols, cv.CV_8U);

    white = new cv.Mat;
    let low = new cv.Mat(image.rows, image.cols, image.type(), [180, 180, 180, 255]);
    let high = new cv.Mat(image.rows, image.cols, image.type(), [255, 255, 255, 255]);

    cv.inRange(image, low, high, white);

    low.delete();
    high.delete();

    cv.bitwise_not(gray, gray);

    cv.cvtColor(image, gray, cv.COLOR_BGR2GRAY, 0);

    cv.GaussianBlur(gray, gray, new cv.Size(9, 9), 2, 2);

    circles = new cv.Mat;

    display(white);

    let houghWhite = white.clone();

    cv.blur(houghWhite, houghWhite, new cv.Size(9, 9));
    // cv.GaussianBlur(houghWhite, houghWhite, new cv.Size(9, 9), 2, 2);
    cv.HoughCircles(houghWhite, circles, cv.HOUGH_GRADIENT, 1, houghWhite.rows / 8, 100, 50, 0, 0);

    display(houghWhite);

    houghWhite.delete();

    // Find the central anchor
    let bestCircle = null;
    let bestDist2 = Infinity;

    for (let i = 0; i < circles.cols; ++i) {
        const circle = circles[i];
        const x = circles.data32F[i * 3];
        const y = circles.data32F[i * 3 + 1];
        const radius = circles.data32F[i * 3 + 2];

        const xDiff = x - image.cols / 2;
        const yDiff = y - image.rows / 2;

        const centerDist2 = xDiff * xDiff + yDiff * yDiff;
        if (centerDist2 < bestDist2) {
            bestDist2 = centerDist2;
            bestCircle = {
                x: x,
                y: y,
                radius: radius
            };
        }
    }

    // TODO handle no circle
    cv.circle(copy, new cv.Point(bestCircle.x, bestCircle.y), bestCircle.radius, new cv.Scalar(255, 0, 0, 255), 2);

    display(copy);

    // TODO find the corner anchor
    cv.GaussianBlur(white, white, new cv.Size(5, 5), 0);
    // cv.adaptiveThreshold(white, white, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);
    cv.Canny(white, white, 80, 255);

    let contours = new cv.MatVector;
    let hierarchy = new cv.Mat;

    cv.findContours(white, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.size(); ++i) {
        let contour = contours.get(i);
        let approx = new cv.Mat;
        cv.approxPolyDP(contour, approx, 0.07 * cv.arcLength(contour, true), true);

        if (approx.rows === 3) {
            // console.log("tri");
            let inVector = new cv.MatVector;
            inVector.push_back(contour);
            cv.drawContours(copy, inVector, 0, new cv.Scalar(255, 0, 0, 255), 2);
            inVector.delete();
        }

        approx.delete();
    }

    hierarchy.delete();
    contours.delete();

    display(copy);

    gray.delete();
    copy.delete();
    circles.delete();
    white.delete();
}