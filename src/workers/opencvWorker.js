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
  }
};

function kmeans(message) {
  const startTime = performance.now();

  console.log(performance.now() - startTime, 'Starting...');
  const imageData = message.data.data;
  //define criteria, number of clusters(K) and apply kmeans()
  let sample = new cv.Mat(imageData.height * imageData.width, 3, cv.CV_32F);

  for (var y = 0; y < imageData.height; y++)
    for (var x = 0; x < imageData.width; x++) {
      const offset = y * 4 + x * imageData.height * 4;
      const color = culori.lab65({
        mode: 'rgb',
        r: imageData.data[offset] / 255,
        g: imageData.data[offset + 1] / 255,
        b: imageData.data[offset + 2] / 255
      });
      sample.floatPtr(y + x * imageData.height)[0] = color.l;
      sample.floatPtr(y + x * imageData.height)[1] = color.a;
      sample.floatPtr(y + x * imageData.height)[2] = color.b;
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

  for (y = 0; y < imageData.height; y++)
    for (x = 0; x < imageData.width; x++) {
      var cluster_idx = labels.intAt(y + x * imageData.height, 0);
      const color = culori.rgb({
        mode: 'lab65',
        l: centers.floatAt(cluster_idx, 0),
        a: centers.floatAt(cluster_idx, 1),
        b: centers.floatAt(cluster_idx, 2)
      });
      const imageDataOffset = y * 4 + x * imageData.height * 4;
      imageData.data[imageDataOffset + 0] = color.r * 255;
      imageData.data[imageDataOffset + 1] = color.g * 255;
      imageData.data[imageDataOffset + 2] = color.b * 255;
      //imageData.data[imageDataOffset + 3] = 255;

      centersWeight[cluster_idx]++;
    }

  console.log(performance.now() - startTime, 'Posting result');

  let colors = [];

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
