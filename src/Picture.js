/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import * as chromatism from 'chromatism';
import { OpenCvContext } from 'OpenCvProvider';
import { Button } from '@mui/material';
import MapColorSelector from 'MapColorSelector';

const Picture = (props) => {
  const context = React.useContext(OpenCvContext);
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [mouseDown, setMouseDown] = React.useState(false);
  const [colors, setColors] = React.useState([]);
  const [imgCanvas, setImgCanvas] = React.useState(null);
  const [imgSrc, setImgSrc] = React.useState(null);

  /*const OnMove = (x, y) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = ((x - rect.left) / rect.width) * canvas.width;
    const canvasY = ((y - rect.top) / rect.height) * canvas.height;

    selectColor(canvasX, canvasY);
  };*/

  const selectColor = (x, y) => {
    console.log(x, y, imgCanvas.width, imgCanvas.height);
    const ctx = imgCanvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1);
    const newColor = chromatism.convert({
      r: pixel.data[0],
      g: pixel.data[1],
      b: pixel.data[2]
    }).hex;
    setSelectedColor(newColor);
    if (props.onChange) {
      props.onChange(chromatism.convert(newColor).cielab);
    }
  };

  const transform = () => {
    try {
      const canvas = imgCanvas;
      const ctx = canvas.getContext('2d');
      const cv = context.cv;
      const mat = cv.matFromImageData(
        ctx.getImageData(0, 0, canvas.width, canvas.height)
      );
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

      cv.kmeans(
        sample,
        clusterCount,
        labels,
        crite,
        attempts,
        cv.KMEANS_RANDOM_CENTERS,
        centers
      );

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

      let imgData = ctx.createImageData(newImage.cols, newImage.rows);
      imgData.data.set(
        new Uint8ClampedArray(newImage.data, newImage.cols, newImage.rows)
      );
      ctx.putImageData(imgData, 0, 0);

      let colors = [];

      for (x = 0; x < centers.rows; x++) {
        const R = centers.floatAt(x, 0);
        const G = centers.floatAt(x, 1);
        const B = centers.floatAt(x, 2);
        const color = chromatism.convert({ r: R, g: G, b: B }).hex;
        colors.push(color);
      }

      colors.sort(
        (a, b) => chromatism.convert(b).hsv.h - chromatism.convert(a).hsv.h
      );

      setColors(colors);
      canvas.toBlob((blob) => {
        setImgSrc(URL.createObjectURL(blob));
      });
    } catch (ex) {
      console.log(ex);
    }
  };

  const loadImage = (src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, img.width, img.height);
      setImgCanvas(canvas);
      canvas.toBlob((blob) => {
        setImgSrc(URL.createObjectURL(blob));
      });
    };
  };

  return (
    <div className="PictureContainer">
      <div
        style={{
          flex: '1',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        <MapColorSelector
          style={{ flex: '1', minHeight: 0, height: '90%' }}
          src={imgSrc}
          imgHeight={imgCanvas?.height}
          imgWidth={imgCanvas?.width}
          click={(e) => selectColor(e.x, e.y)}
        />
        <div className="ColorsContainer">
          {colors.map((c) => (
            <div
              key={c}
              className="ColorCell"
              style={{ width: 'auto', height: 'auto', backgroundColor: c }}
              onClick={() => {
                setSelectedColor(c);
                if (props.onChange) {
                  props.onChange(chromatism.convert(c).cielab);
                }
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
      <input
        style={{ flex: '0 0 auto' }}
        type="file"
        name="file"
        onChange={(e) => loadImage(URL.createObjectURL(e.target.files[0]))}
      />
      <div
        className="SelectedColor"
        style={{ flex: '0 0 auto', backgroundColor: selectedColor }}
      >
        {selectedColor}
      </div>
      <Button
        style={{ flex: '0 0 auto' }}
        onClick={() => {
          transform();
        }}
      >
        Transform
      </Button>
    </div>
  );
};

export default Picture;
