import processSquare from "./processSquare.js";
import process0 from "./process0.js";
import * as util from "../util.js";

export default function preprocessSquare(image, log, display) {
    let gray;
    let copy;
    let circles;
    let white;
    let hsv;

    let low;
    let high;

    copy = image.clone();
    gray = cv.Mat.zeros(image.rows, image.cols, cv.CV_8U);

    white = new cv.Mat;
    low = new cv.Mat(image.rows, image.cols, image.type(), new cv.Scalar(180, 180, 180));
    high = new cv.Mat(image.rows, image.cols, image.type(), new cv.Scalar(255, 255, 255));

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
                radius: radius + 1
            };
        }
    }

    // TODO handle no circle
    cv.circle(copy, new cv.Point(bestCircle.x, bestCircle.y), bestCircle.radius, new cv.Scalar(255, 0, 0), 2);

    display(copy);

    // TODO find the corner anchor
    cv.GaussianBlur(white, white, new cv.Size(5, 5), 0);
    // cv.adaptiveThreshold(white, white, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);
    cv.Canny(white, white, 80, 255);

    let contours = new cv.MatVector;
    let hierarchy = new cv.Mat;

    cv.findContours(white, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_NONE);

    let cornerAnchor = null;
    let orientation = null;

    console.log(contours.size());
    for (let i = 0; i < contours.size(); ++i) {
        let contour = contours.get(i);
        let approx = new cv.Mat;
        cv.approxPolyDP(contour, approx, 0.07 * cv.arcLength(contour, true), true);

        if (approx.rows === 3) {
            // TODO check if correct angle/proportions?
            cornerAnchor = contour;
            let inVector = new cv.MatVector;
            inVector.push_back(contour);
            cv.drawContours(copy, inVector, 0, new cv.Scalar(255, 0, 0), 2);
            inVector.delete();

            console.log(`approx ${approx.size()}`);
            console.log(approx.size());
            // Check corner
            let points = [];
            for (let c = 0; c < approx.rows; ++c) {
                let point = approx.row(c);
                const ptr = point.intPtr(0, 0);
                points.push(new cv.Point(ptr[0], ptr[1]));
                console.log(`point: (${ptr[0]}, ${ptr[1]})`);
            }

            orientation = getOrientation(points, image.size());
            break;
        }

        approx.delete();
    }

    switch (orientation) {
        case 0:
            break;
        case 1:
            util.rotate270(image, image);
            break;
        case 2:
            util.rotate180(image, image);
            break;
        case 3:
            util.rotate90(image, image);
            break;
    }

    // Remove white areas
    hsv = image.clone();
    cv.cvtColor(hsv, hsv, cv.COLOR_BGR2HSV);

    low = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), new cv.Scalar(0, 0, 0));
    high = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), new cv.Scalar(0, 0, 255));

    let mask = new cv.Mat;
    cv.inRange(hsv, low, high, mask);

    let res = new cv.Mat;
    cv.bitwise_not(mask, mask);
    cv.bitwise_and(image, image, res, mask);

    low.delete();
    high.delete();

    hierarchy.delete();
    contours.delete();

    display(res);

    mask.delete();

    gray.delete();
    copy.delete();
    circles.delete();
    white.delete();
    hsv.delete();

    const result = process0(res, bestCircle, log, display);

    res.delete();

    return result;
}

/*
0 -> top left
1 -> top right
2 -> bottom right
3 -> bottom left
 */
function getOrientation(triangle, dim) {
    let last2 = triangle[1];
    let last1 = triangle[2];
    for (let i = 0; i < triangle.length; ++i) {
        let current = triangle[i];

        let vec1 = new cv.Point(last1.x - last2.x, last1.y - last2.y);
        let vec2 = new cv.Point(current.x - last1.x, current.y - last1.y);

        const top = vec1.x * vec2.x + vec1.y * vec2.y;
        const bottom = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y) * Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);

        const angle = Math.acos(top / bottom);
        if (angle >= 4 / 9 * Math.PI && angle <= 5 / 9 * Math.PI) {
            const left = last1.x < dim.width / 2;
            const top = last1.y < dim.height / 2;

            if (top) {
                if (left) return 0;
                return 1;
            }
            if (left) return 3;
            return 2;
        }

        last2 = last1;
        last1 = current;
    }
}