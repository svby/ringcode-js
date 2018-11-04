import process0 from "./processors/process0.js";
import * as util from "../util.js";

export default function preprocessSquare(reader, image, config) {
    config.log();

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

    config.log("pp", "Applied white mask");

    low.delete();
    high.delete();

    cv.bitwise_not(gray, gray);

    cv.cvtColor(image, gray, cv.COLOR_BGR2GRAY, 0);

    cv.GaussianBlur(gray, gray, new cv.Size(9, 9), 2, 2);

    circles = new cv.Mat;

    config.displayStep(white);

    let houghWhite = white.clone();

    // cv.blur(houghWhite, houghWhite, new cv.Size(9, 9));
    cv.GaussianBlur(houghWhite, houghWhite, new cv.Size(7, 7), 2, 2);
    cv.HoughCircles(houghWhite, circles, cv.HOUGH_GRADIENT, 1, houghWhite.rows / 8, 100, 50, 0, 0);

    config.log("pp", "Applied Hough transform");

    config.displayStep(houghWhite);

    houghWhite.delete();

    // Find the central anchor
    let bestCircle = null;
    let bestDist2 = Infinity;

    for (let i = 0; i < circles.cols; ++i) {
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

    if (bestCircle === null) {
        config.log("pp", "No central anchor point found");
        return null;
    }
    config.log("pp", "Central anchor point located");

    cv.circle(copy, new cv.Point(bestCircle.x, bestCircle.y), bestCircle.radius, new cv.Scalar(255, 0, 0), 2);

    config.displayStep(copy);

    cv.GaussianBlur(white, white, new cv.Size(5, 5), 0);
    // cv.adaptiveThreshold(white, white, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);
    cv.Canny(white, white, 80, 255);

    let contours = new cv.MatVector;
    let hierarchy = new cv.Mat;

    config.log("pp", "Applying edge detection to white mask");

    cv.findContours(white, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_NONE);

    let cornerAnchor = null;
    let cornerPoint = null;

    console.log(contours.size());
    for (let i = 0; i < contours.size(); ++i) {
        let contour = contours.get(i);
        let approx = new cv.Mat;
        cv.approxPolyDP(contour, approx, 0.07 * cv.arcLength(contour, true), true);

        if (approx.rows === 3) {
            const area = cv.contourArea(contour);

            // Definitely too small
            if (area <= util.config.anchorSize * util.config.anchorSize / 2 * 0.9) continue;

            cornerAnchor = contour;
            let inVector = new cv.MatVector;
            inVector.push_back(contour);
            cv.drawContours(copy, inVector, 0, new cv.Scalar(255, 0, 0), 2);
            inVector.delete();

            // Check corner
            let points = [];
            for (let c = 0; c < approx.rows; ++c) {
                let point = approx.row(c);
                const ptr = point.intPtr(0, 0);
                points.push(new cv.Point(ptr[0], ptr[1]));
                console.log(`point: (${ptr[0]}, ${ptr[1]})`);
            }

            cornerPoint = getCorner(points);
            break;
        }

        approx.delete();
    }

    if (cornerAnchor === null || !cornerPoint) {
        config.log("pp", "No corner anchor found");
        return null;
    }

    config.displayStep(copy);

    const orientation = getOrientation(cornerPoint, white.size());

    config.log("pp", "Corner anchor point located");
    config.log("pp", `orientation: ${orientation} (${orientationString(orientation)})`);

    let maxXy;
    switch (orientation) {
        case 0:
            maxXy = (cornerPoint.x + cornerPoint.y) / 2;
            break;
        case 1:
            maxXy = ((image.cols - cornerPoint.x) + cornerPoint.y) / 2;
            util.rotate270(image, image);
            break;
        case 2:
            maxXy = ((image.cols - cornerPoint.x) + (image.rows - cornerPoint.y)) / 2;
            util.rotate180(image, image);
            break;
        case 3:
            maxXy = (cornerPoint.x + (image.rows - cornerPoint.y)) / 2;
            util.rotate90(image, image);
            break;
    }

    config.log("pp", `maxXy = ${maxXy}`);

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

    config.log("pp", "Applied inverse white mask");

    low.delete();
    high.delete();

    hierarchy.delete();
    contours.delete();

    config.displayStep(res);

    mask.delete();

    gray.delete();
    copy.delete();
    circles.delete();
    white.delete();
    hsv.delete();

    const result = process0(reader, res, bestCircle, maxXy, config);

    res.delete();

    return result;
}

function orientationString(orientation) {
    switch (orientation) {
        case 0:
            return "TOPLEFT";
        case 1:
            return "TOPRIGHT";
        case 2:
            return "BOTTOMRIGHT";
        case 3:
            return "BOTTOMLEFT";
    }
}

function getCorner(triangle) {
    let last2 = triangle[1];
    let last1 = triangle[2];
    for (let i = 0; i < triangle.length; ++i) {
        let current = triangle[i];

        let vec1 = new cv.Point(last1.x - last2.x, last1.y - last2.y);
        let vec2 = new cv.Point(current.x - last1.x, current.y - last1.y);

        const top = vec1.x * vec2.x + vec1.y * vec2.y;
        const bottom = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y) * Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);

        const angle = Math.acos(top / bottom);
        if (angle >= 5 / 11 * Math.PI && angle <= 6 / 11 * Math.PI) return last1;

        last2 = last1;
        last1 = current;
    }
}

/*
0 -> top left
1 -> top right
2 -> bottom right
3 -> bottom left
 */
function getOrientation(point, dim) {
    const left = point.x < dim.width / 2;
    const top = point.y < dim.height / 2;

    if (top) {
        if (left) return 0;
        return 1;
    }
    if (left) return 3;
    return 2;
}