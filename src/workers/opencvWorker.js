/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import cv from '../imports/opencv';
import * as culori from 'culori';

cv['onRuntimeInitialized'] = () => {
  console.log('Worker ready');
};

console.log('Loaded worker');

let transformationColorsNumber = 16;

onmessage = (message) => {
  if (message.data.type === 'kmeans') {
    kmeans(message);
  } else if (message.data.type === 'setTransformationColorsNumber') {
    transformationColorsNumber = message.data.value;
  } else if (message.data.type === 'extract') {
    extract(message);
  }
};

function kmeans(message) {
  const startTime = performance.now();

  console.log(performance.now() - startTime, 'Starting...');
  const imageData = message.data.data;
  //define criteria, number of clusters(K) and apply kmeans()

  let colors = [];

  for (var y = 0; y < imageData.height; y++)
    for (var x = 0; x < imageData.width; x++) {
      const offset = y * 4 + x * imageData.height * 4;
      if (imageData.data[offset + 3] === 0) {
        continue;
      }
      const color = culori.lab65({
        mode: 'rgb',
        r: imageData.data[offset] / 255,
        g: imageData.data[offset + 1] / 255,
        b: imageData.data[offset + 2] / 255
      });
      colors.push(color);
    }

  let sample = new cv.Mat(colors.length, 3, cv.CV_32F);

  for (var i = 0; i < colors.length; i++) {
    sample.floatPtr(i)[0] = colors[i].l;
    sample.floatPtr(i)[1] = colors[i].a;
    sample.floatPtr(i)[2] = colors[i].b;
  }

  var labels = new cv.Mat();
  var attempts = 1;
  var centers = new cv.Mat();

  var crite = new cv.TermCriteria(
    cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER,
    10000,
    0.0001
  );

  console.log(performance.now() - startTime, 'Starting k-means');

  cv.kmeans(
    sample,
    transformationColorsNumber,
    labels,
    crite,
    attempts,
    cv.KMEANS_RANDOM_CENTERS,
    centers
  );

  console.log(performance.now() - startTime, 'Completed k-means');

  let centersWeight = [];
  for (x = 0; x < centers.rows; x++) {
    centersWeight.push(0);
  }

  let colorIndex = 0;
  for (y = 0; y < imageData.height; y++)
    for (x = 0; x < imageData.width; x++) {
      const imageDataOffset = y * 4 + x * imageData.height * 4;
      if (imageData.data[imageDataOffset + 3] === 0) {
        continue;
      }

      var cluster_idx = labels.intAt(colorIndex, 0);
      const color = culori.rgb({
        mode: 'lab65',
        l: centers.floatAt(cluster_idx, 0),
        a: centers.floatAt(cluster_idx, 1),
        b: centers.floatAt(cluster_idx, 2)
      });
      imageData.data[imageDataOffset + 0] = color.r * 255;
      imageData.data[imageDataOffset + 1] = color.g * 255;
      imageData.data[imageDataOffset + 2] = color.b * 255;
      //imageData.data[imageDataOffset + 3] = 255;

      centersWeight[cluster_idx]++;
      colorIndex++;
    }

  console.log(performance.now() - startTime, 'Posting result');

  colors = [];

  for (x = 0; x < centers.rows; x++) {
    const color = culori.rgb({
      mode: 'lab65',
      l: centers.floatAt(x, 0),
      a: centers.floatAt(x, 1),
      b: centers.floatAt(x, 2)
    });
    colors.push({
      color: { mode: 'rgb', r: color.r, g: color.g, b: color.b },
      weight: centersWeight[x]
    });
  }

  postMessage({ ...message.data, colors: colors });
}

function extract(message) {
  let input = cv.matFromImageData(message.data.data);

  let sample = new cv.Mat();
  cv.cvtColor(input, sample, cv.COLOR_RGBA2GRAY, 0);

  cv.Canny(sample, sample, 50, 100, 3, true);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.findContours(
    sample,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_NONE
  );

  let mask = new cv.Mat(sample.rows, sample.cols, cv.CV_8U, new cv.Scalar(0));

  cv.drawContours(mask, contours, -1, new cv.Scalar(255), cv.FILLED);

  let kernel = cv.Mat.ones(5, 5, cv.CV_8U);
  cv.dilate(mask, mask, kernel);

  contours = new cv.MatVector();
  hierarchy = new cv.Mat();

  cv.findContours(
    mask,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_NONE
  );

  mask = cv.Mat.zeros(sample.rows, sample.cols, cv.CV_8U);
  for (let i = 0; i < contours.size(); i++) {
    let dist = cv.pointPolygonTest(
      contours.get(i),
      new cv.Point(mask.cols / 2, mask.rows / 2),
      false
    );
    if (dist >= 0) {
      cv.drawContours(mask, contours, i, new cv.Scalar(255), cv.FILLED);
    }
  }

  let resultMat = cv.Mat.zeros(sample.rows, sample.cols, cv.CV_8UC4);

  input.copyTo(resultMat, mask);

  let result = new ImageData(
    new Uint8ClampedArray(resultMat.data, resultMat.cols, resultMat.rows),
    resultMat.cols
  );

  postMessage({ type: 'extract', data: result });
}
