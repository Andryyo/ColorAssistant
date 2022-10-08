/* eslint-disable react/prop-types */

import { Slider } from '@mui/material';
import * as chromatism from 'chromatism';
import MapColorSelector from 'MapColorSelector';
import React from 'react';

const fastConvert = (H, S, V, n) => {
  const k = (n + H / 60) % 6;
  return (V - V * S * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
};

const ColorSelector = (props) => {
  const [value, setValue] = React.useState(100);
  const [selectedColor, setSelectedColor] = React.useState('#ffffff');
  const [text, setText] = React.useState('#ffffff');
  //const [mouseDown, setMouseDown] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(null);
  const [imgCanvas, setImgCanvas] = React.useState(null);

  React.useEffect(() => {
    const canvas = new OffscreenCanvas(400, 400);

    const imageData = canvas
      .getContext('2d')
      .createImageData(canvas.width, canvas.height);
    const data = imageData.data;

    for (let x = 0; x < imageData.width; x++)
      for (let y = 0; y < imageData.height; y++) {
        const offset = 4 * (y * imageData.width + x);

        const dx =
          ((((x - imageData.width / 2) / imageData.width) * 2) / value) * 100;
        const dy =
          ((((y - imageData.height / 2) / imageData.height) * 2) / value) * 100;
        const saturation = Math.sqrt(dx * dx + dy * dy);

        if (saturation > 1) {
          data[offset] = 255;
          data[offset + 1] = 255;
          data[offset + 2] = 255;
          data[offset + 3] = 0;
          continue;
        }

        const hue = (-Math.atan2(dy, dx) * 180) / Math.PI;
        data[offset] = fastConvert(hue, saturation, value / 100, 5);
        data[offset + 1] = fastConvert(hue, saturation, value / 100, 3);
        data[offset + 2] = fastConvert(hue, saturation, value / 100, 1);
        data[offset + 3] = 255;
      }

    canvas.getContext('2d').putImageData(imageData, 0, 0);

    setImgCanvas(canvas);
    canvas.convertToBlob().then((blob) => setImgSrc(URL.createObjectURL(blob)));
  }, [value]);

  const selectColorByPosition = (x, y) => {
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
    setText(newColor);
    if (props.onChange) {
      props.onChange(chromatism.convert(newColor).cielab);
    }
  };

  const selectColor = (color) => {
    setValue(chromatism.convert(color).hsv.v);
    setSelectedColor(color);
    setText(color);
    if (props.onChange) {
      props.onChange(chromatism.convert(color).cielab);
    }
  };

  const onValueChanging = (event, newValue) => {
    const color = chromatism.convert(selectedColor).hsv;
    const newColor = chromatism.convert({
      h: color.h,
      s: color.s,
      v: newValue
    }).hex;

    setValue(newValue);
    setSelectedColor(newColor);
    setText(newColor);
  };

  const onValueChanged = (event, newValue) => {
    const color = chromatism.convert(selectedColor).hsv;
    const newColor = chromatism.convert({
      h: color.h,
      s: color.s,
      v: newValue
    }).hex;

    setValue(newValue);
    setSelectedColor(newColor);
    setText(newColor);

    if (props.onChange) {
      props.onChange(chromatism.convert(newColor).cielab);
    }
  };

  const colorToPosition = (color) => {
    try {
      const hsv = chromatism.convert(color).hsv;
      if (!hsv.h || !hsv.s || !hsv.v) {
        return null;
      }

      const angle = (-hsv.h / 180) * Math.PI;
      return {
        x:
          (((((Math.cos(angle) * hsv.s) / 100) * imgCanvas.width) / 2) *
            value) /
            100 +
          imgCanvas.width / 2,
        y:
          (((((Math.sin(angle) * hsv.s) / 100) * imgCanvas.height) / 2) *
            value) /
            100 +
          imgCanvas.height / 2,
        value: hsv.v
      };
    } catch {
      return null;
    }
  };

  let markers = null;

  if (props.topColors) {
    markers = props.topColors
      .slice(0, 10)
      .map((c) => {
        const pos = colorToPosition(c.color);
        if (pos) {
          return { x: pos.x, y: pos.y, ...c };
        } else {
          return null;
        }
      })
      .filter((m) => m);
  }

  if (selectedColor) {
    const pos = colorToPosition(selectedColor);
    if (pos) {
      markers.push({ x: pos.x, y: pos.y, hex: selectedColor, selected: true });
    }
  }

  markers = [...new Map(markers.map((m) => [m.color, m])).values()];
  markers.sort((a, b) => a.delta - b.delta);

  return (
    <div className="ColorWheelContainer">
      <MapColorSelector
        style={{ flex: '1', minHeight: 0, width: '90%' }}
        src={imgSrc}
        imgHeight={imgCanvas?.height}
        imgWidth={imgCanvas?.width}
        markers={markers}
        topColor={props.topColors && props.topColors[0]}
        click={(e) => selectColorByPosition(e.x, e.y)}
        markerSelected={(m) => {
          selectColor(m.color);
        }}
      />
      <div className="SliderContainer">
        <Slider
          value={value}
          onChange={onValueChanging}
          onChangeCommitted={onValueChanged}
        />
      </div>
      <input
        type="text"
        className="SelectedColor"
        style={{ backgroundColor: selectedColor }}
        value={text}
        onChange={(e) => selectColor(e.target.value)}
      />
    </div>
  );
};

export default ColorSelector;
