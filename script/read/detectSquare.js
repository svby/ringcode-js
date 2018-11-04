import preprocessSquare from "./preprocessSquare.js";

export default function detectSquare(reader, img, config) {
    config.log();

    let copy = img.clone();
    let thresholded = img.clone();
    let contours = new cv.MatVector;
    let hierarchy = new cv.Mat;
    let warped;
    try {
        // region contours
        config.displayStep(copy);

        cv.cvtColor(thresholded, thresholded, cv.COLOR_BGR2GRAY);
        config.log("dt", "Converted source copy into grayscale");

        cv.threshold(thresholded, thresholded, 70, 200, cv.THRESH_BINARY_INV);
        cv.blur(thresholded, thresholded, new cv.Size(5, 5));
        cv.threshold(thresholded, thresholded, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

        config.log("dt", "Applied Otsu thresholding");

        config.displayStep(thresholded);

        cv.blur(thresholded, thresholded, new cv.Size(7, 7));
        cv.findContours(thresholded, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

        config.displayStep(thresholded);

        let best = null;
        let bestArea = null;
        let quads = 0;

        for (let i = 0; i < contours.size(); ++i) {
            let contour = contours.get(i);
            let approx = new cv.Mat;
            try {
                cv.approxPolyDP(contour, approx, 0.02 * cv.arcLength(contour, true), true);

                if (approx.rows === 4) {
                    quads++;
                    const area = cv.contourArea(approx);

                    if (bestArea === null) {
                        best = approx;
                        bestArea = area;
                    } else if (bestArea < area) {
                        bestArea = area;
                        best.delete();
                        best = approx;
                    } else approx.delete();
                } else {
                    approx.delete();
                }
            } finally {
                contour.delete();
            }
        }

        config.log("dt", `Found ${quads} quadrilaterals`);

        config.displayStep(copy);
        // endregion contours

        if (best === null) {
            config.log("dt", "Could not detect a tag, using whole image");
            warped = img.clone();
        } else {
            let inputArray = new cv.MatVector;
            let mask = cv.Mat.zeros(copy.size(), cv.CV_8UC1);
            let masked = new cv.Mat;

            try {
                config.log("dt", `Using largest quadrilateral (area: ${bestArea})`);
                let points = [];
                console.log(best.type());
                for (let i = 0; i < best.rows; ++i) {
                    const ptr = best.intPtr(i, 0);
                    points.push(ptr[0], ptr[1]);
                }
                config.log("dt", `Quadrilateral points: ${points}`);

                console.log(`warp points: ${points}`);

                inputArray.push_back(best);
                cv.drawContours(copy, inputArray, 0, new cv.Scalar(255, 0, 0, 0), 10);

                config.display(copy);

                cv.drawContours(mask, inputArray, -1, new cv.Scalar(255), -1);
                config.displayStep(mask);

                cv.bitwise_and(img, img, masked, mask);
                config.displayStep(masked);
                config.log("dt", "Applied quadrilateral mask");

                warped = cv.Mat.zeros(new cv.Size(550, 550), img.type());

                let source = cv.matFromArray(4, 1, cv.CV_32FC2, points);
                let dest = cv.matFromArray(4, 1, cv.CV_32FC2, [550, 550, 550, 0, 0, 0, 0, 550]);
                let M = cv.getPerspectiveTransform(source, dest);
                source.delete();
                dest.delete();

                cv.warpPerspective(masked, warped, M, new cv.Size(550, 550), cv.INTER_LINEAR, cv.BORDER_CONSTANT);

                M.delete();

                config.log("dt", "Warped detected area onto (550, 550)");

                config.displayStep(warped);
            } finally {
                inputArray.delete();
                mask.delete();
                masked.delete();
            }
        }

        best.delete();

        config.log("dt", "Detected square");

        cv.resize(warped, warped, new cv.Size(550, 550));

        return preprocessSquare(reader, warped, config);
    } finally {
        copy.delete();
        thresholded.delete();
        contours.delete();
        hierarchy.delete();
        if (warped) warped.delete();
    }
}