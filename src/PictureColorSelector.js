/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import { Button } from '@mui/material';
import MapColorSelector from 'MapColorSelector';

import * as culori from 'culori';

const Picture = (props) => {
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [selectedPosition, setSelectedPosition] = React.useState(null);
  const [colors, setColors] = React.useState([]);
  const [imgCanvas, setImgCanvas] = React.useState(null);
  const [imgSrc, setImgSrc] = React.useState(null);

  const selectColor = (x, y) => {
    const ctx = imgCanvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1);

    if (pixel.data[3] == 0) {
      return;
    }

    const newColor = {
      mode: 'rgb',
      r: pixel.data[0] / 256,
      g: pixel.data[1] / 256,
      b: pixel.data[2] / 256
    };

    setSelectedColor(culori.formatHex(newColor));
    setSelectedPosition({ x, y });
    if (props.onChange) {
      props.onChange(culori.lab65(newColor));
    }
  };

  const transform = () => {
    const data = imgCanvas
      .getContext('2d')
      .getImageData(0, 0, imgCanvas.width, imgCanvas.height);

    const ratio = imgCanvas.width / imgCanvas.height;
    const newCanvas = new OffscreenCanvas(300, 300 / ratio);
    const newCtx = newCanvas.getContext('2d');
    newCtx.drawImage(imgCanvas, 0, 0, newCanvas.width, newCanvas.height);
    const newData = newCtx.getImageData(
      0,
      0,
      newCanvas.width,
      newCanvas.height
    );

    props.worker.postMessage({ type: 'kmeans', data: newData });

    props.worker.onmessage = (message) => {
      if (message.data.type === 'kmeans') {
        newCtx.putImageData(message.data.data, 0, 0);
        imgCanvas
          .getContext('2d')
          .drawImage(newCanvas, 0, 0, imgCanvas.width, imgCanvas.height);

        imgCanvas
          .convertToBlob()
          .then((blob) => setImgSrc(URL.createObjectURL(blob)));

        let colors = message.data.colors.map((c) => culori.formatHex(c));

        colors = [...new Set(colors)];

        colors.sort((a, b) => culori.hsv(b).h - culori.hsv(a).h);
        setColors(colors);
      }
    };
  };

  const loadImage = (src) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImgCanvas(canvas);
      canvas
        .convertToBlob()
        .then((blob) => setImgSrc(URL.createObjectURL(blob)));
    };
  };

  const boxzoomend = (x1, y1, x2, y2) => {
    const canvas = new OffscreenCanvas(x2 - x1, y2 - y1);

    canvas
      .getContext('2d')
      .drawImage(
        imgCanvas,
        x1,
        y1,
        x2 - x1,
        y2 - y1,
        0,
        0,
        canvas.width,
        canvas.height
      );

    setImgCanvas(canvas);

    canvas.convertToBlob().then((blob) => setImgSrc(URL.createObjectURL(blob)));
  };

  let markers = [];

  if (selectedColor && selectedPosition) {
    markers.push({
      x: selectedPosition.x,
      y: selectedPosition.y,
      hex: selectedColor,
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
          style={{ flex: '1', minHeight: 0, height: '100%' }}
          src={imgSrc}
          imgHeight={imgCanvas?.height}
          imgWidth={imgCanvas?.width}
          click={(e) => selectColor(e.x, e.y)}
          markers={markers}
          topColor={props.topColors && props.topColors[0]}
          boxzoomend={boxzoomend}
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
                  props.onChange(culori.lab65(c));
                }
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
      <input
        style={{ flex: '0 0 auto', width: '95%' }}
        type="url"
        onChange={(e) => loadImage(e.target.value)}
      />
      <input
        style={{ flex: '0 0 auto', width: '95%' }}
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
