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
  const imageData = message.data.data;
  //define criteria, number of clusters(K) and apply kmeans()
  let sample = new cv.Mat(imageData.height * imageData.width, 3, cv.CV_32F);

  for (var y = 0; y < imageData.height; y++)
    for (var x = 0; x < imageData.width; x++)
      for (var z = 0; z < 3; z++)
        sample.floatPtr(y + x * imageData.height)[z] =
          imageData.data[y * 4 + x * imageData.height * 4 + z];

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

  for (y = 0; y < imageData.height; y++)
    for (x = 0; x < imageData.width; x++) {
      var cluster_idx = labels.intAt(y + x * imageData.height, 0);
      const red = centers.floatAt(cluster_idx, 0);
      const green = centers.floatAt(cluster_idx, 1);
      const blue = centers.floatAt(cluster_idx, 2);
      const alpha = 255;
      const imageDataOffset = y * 4 + x * imageData.height * 4;
      imageData.data[imageDataOffset + 0] = red;
      imageData.data[imageDataOffset + 1] = green;
      imageData.data[imageDataOffset + 2] = blue;
      //imageData.data[imageDataOffset + 3] = alpha;
    }

  console.log(performance.now() - startTime, 'Posting result');

  let colors = [];

  for (x = 0; x < centers.rows; x++) {
    const R = centers.floatAt(x, 0);
    const G = centers.floatAt(x, 1);
    const B = centers.floatAt(x, 2);
    colors.push({ r: R, g: G, b: B });
  }

  self.postMessage({ ...message.data, colors: colors });
}
