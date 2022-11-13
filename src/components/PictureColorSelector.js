/* eslint-disable react/prop-types */
import React from 'react';
import { Button } from '@mui/material';
import MapColorSelector from './MapColorSelector';
import * as culori from 'culori';
import { db } from '../db/db';

const Picture = (props) => {
  const [selectedPosition, setSelectedPosition] = React.useState(null);
  const [colors, setColors] = React.useState([]);
  const [imgCanvas, setImgCanvas] = React.useState(null);
  const [imgSrc, setImgSrc] = React.useState(null);
  const fileInput = React.useRef(null);

  const selectColor = (x, y) => {
    const ctx = imgCanvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1);

    if (pixel.data[3] === 0) {
      return;
    }

    const newColor = {
      mode: 'rgb',
      r: pixel.data[0] / 255,
      g: pixel.data[1] / 255,
      b: pixel.data[2] / 255
    };

    setSelectedPosition({ x, y });
    if (props.onChange) {
      props.onChange(culori.lab65(newColor));
    }
  };

  const transform = () => {
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

        const map = new Map();
        message.data.colors.forEach((item) => {
          const key = culori.formatHex(item.color);
          const existing = map.get(key);
          if (!existing) {
            map.set(key, { color: key, weight: item.weight });
          } else {
            existing.weight += item.weight;
          }
        });

        const colors = Array.from(map.values());
        colors.sort((a, b) => culori.hsv(b.color).h - culori.hsv(a.color).h);
        setColors(colors);
      }
    };
  };

  React.useEffect(() => {
    if (props.src) {
      loadImage(URL.createObjectURL(props.src.data));
    }
  }, [props.src]);

  const saveToGallery = async () => {
    const ratio = imgCanvas.width / imgCanvas.height;
    const newCanvas = new OffscreenCanvas(100, 100 / ratio);
    const newCtx = newCanvas.getContext('2d');
    newCtx.drawImage(imgCanvas, 0, 0, newCanvas.width, newCanvas.height);

    const data = await imgCanvas.convertToBlob();
    const preview = await newCanvas.convertToBlob();

    db.gallery.add({
      data: data,
      preview: preview
    });
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

  if (props.selectedColor && selectedPosition) {
    markers.push({
      x: selectedPosition.x,
      y: selectedPosition.y,
      hex: culori.formatHex(props.selectedColor),
      selected: true
    });
  }

  return (
    <div className="PictureContainer" style={props.style}>
      <MapColorSelector
        style={{ display: 'flex', flex: '1', minHeight: 0, height: '100%' }}
        src={imgSrc}
        imgHeight={imgCanvas?.height}
        imgWidth={imgCanvas?.width}
        click={(e) => selectColor(e.x, e.y)}
        markers={markers}
        topColor={props.topColors && props.topColors[0]}
        boxzoomend={boxzoomend}
        active={props.active}
      />
      <div className="ColorsContainer">
        {colors.map((c) => (
          <div
            key={c.color}
            style={{
              height: '5vmin',
              backgroundColor: c.color,
              flexGrow: c.weight
            }}
            onClick={() => {
              if (props.onChange) {
                props.onChange(culori.lab65(c.color));
              }
            }}
          ></div>
        ))}
      </div>
      <input
        style={{ flex: '0 0 auto' }}
        type="url"
        onChange={(e) => loadImage(e.target.value)}
      />
      <div style={{ display: 'flex' }}>
        <Button onClick={() => fileInput.current.click()}>Load picture</Button>
        <input
          style={{ display: 'none' }}
          type="file"
          name="file"
          onChange={(e) => loadImage(URL.createObjectURL(e.target.files[0]))}
          ref={fileInput}
        />
        <Button
          style={{ flex: '0 0 auto' }}
          onClick={() => {
            transform();
          }}
        >
          Transform
        </Button>
        <Button
          style={{ flex: '0 0 auto' }}
          onClick={() => {
            saveToGallery();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default Picture;
