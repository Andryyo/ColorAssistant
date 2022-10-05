/* eslint-disable no-undef */
importScripts('/ColorAssistant/opencv.js');
cv['onRuntimeInitialized'] = () => {
  console.log('Worker ready');
};

console.log('Loaded worker');

self.onmessage = (message) => {
  if (message.data.type === 'kmeans') {
    kmeans(message);
  }
};

function kmeans(message) {
  const startTime = performance.now();

  console.log(performance.now() - startTime, 'Starting...');
  const mat = cv.matFromImageData(message.data.data);
  //define criteria, number of clusters(K) and apply kmeans()
  let sample = new cv.Mat(mat.rows * mat.cols, 3, cv.CV_32F);

  for (var y = 0; y < mat.rows; y++)
    for (var x = 0; x < mat.cols; x++)
      for (var z = 0; z < 3; z++)
        sample.floatPtr(y + x * mat.rows)[z] = mat.ucharPtr(y, x)[z];

  var clusterCount = 16;
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
    clusterCount,
    labels,
    crite,
    attempts,
    cv.KMEANS_RANDOM_CENTERS,
    centers
  );

  console.log(performance.now() - startTime, 'Completed k-means');

  var newImage = new cv.Mat(mat.size(), mat.type());
  for (y = 0; y < mat.rows; y++)
    for (x = 0; x < mat.cols; x++) {
      var cluster_idx = labels.intAt(y + x * mat.rows, 0);
      const red = centers.floatAt(cluster_idx, 0);
      const green = centers.floatAt(cluster_idx, 1);
      const blue = centers.floatAt(cluster_idx, 2);
      const alpha = 255;
      newImage.ucharPtr(y, x)[0] = red;
      newImage.ucharPtr(y, x)[1] = green;
      newImage.ucharPtr(y, x)[2] = blue;
      newImage.ucharPtr(y, x)[3] = alpha;
    }

  message.data.data.data.set(
    new Uint8ClampedArray(newImage.data, newImage.cols, newImage.rows)
  );

  console.log(performance.now() - startTime, 'Posting result');

  self.postMessage(message.data);

  /*let colors = [];

      for (x = 0; x < centers.rows; x++) {
        const R = centers.floatAt(x, 0);
        const G = centers.floatAt(x, 1);
        const B = centers.floatAt(x, 2);
        const color = chromatism.convert({ r: R, g: G, b: B }).hex;
        colors.push(color);
      }

      colors.sort(
        (a, b) => chromatism.convert(b).hsv.h - chromatism.convert(a).hsv.h
      );*/

  /*setColors(colors);
      canvas
        .convertToBlob()
        .then((blob) => setImgSrc(URL.createObjectURL(blob)));*/
}
