/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import * as chromatism from 'chromatism';
import { Button } from '@mui/material';
import MapColorSelector from 'MapColorSelector';

const Picture = (props) => {
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [selectedPosition, setSelectedPosition] = React.useState(null);
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
    const ctx = imgCanvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1);

    if (pixel.data[3] == 0) {
      return;
    }

    const newColor = chromatism.convert({
      r: pixel.data[0],
      g: pixel.data[1],
      b: pixel.data[2]
    }).hex;
    setSelectedColor(newColor);
    setSelectedPosition({ x, y });
    if (props.onChange) {
      props.onChange(chromatism.convert(newColor).cielab);
    }
  };

  const transform = () => {
    const data = imgCanvas
      .getContext('2d')
      .getImageData(0, 0, imgCanvas.width, imgCanvas.height);

    props.worker.postMessage({ type: 'kmeans', data: data });

    props.worker.onmessage = (message) => {
      if (message.data.type === 'kmeans') {
        imgCanvas.getContext('2d').putImageData(message.data.data, 0, 0);

        imgCanvas
          .convertToBlob()
          .then((blob) => setImgSrc(URL.createObjectURL(blob)));

        let colors = message.data.colors.map((c) => chromatism.convert(c).hex);

        colors = [...new Set(colors)];

        colors.sort(
          (a, b) => chromatism.convert(b).hsv.h - chromatism.convert(a).hsv.h
        );
        setColors(colors);
      }
    };
  };

  const loadImage = (src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const ratio = img.width / img.height;
      const canvas = new OffscreenCanvas(300, 300 / ratio);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImgCanvas(canvas);
      canvas
        .convertToBlob()
        .then((blob) => setImgSrc(URL.createObjectURL(blob)));
    };
  };

  let markers = [];

  if (selectedColor && selectedPosition) {
    markers.push({
      x: selectedPosition.x,
      y: selectedPosition.y,
      id: selectedColor,
      selected: true
    });
  }

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
          markers={markers}
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
