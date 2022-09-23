/* eslint-disable react/prop-types */

import { Slider } from "@mui/material";
import * as chromatism from "chromatism"
import React from "react";

const fastConvert = (H, S, V, n) => {
const k = (n + H / 60) % 6;
return (V - V * S * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
}

const colorToPosition = (canvasRef, color) => {
  try {
  const hsv = chromatism.convert(color).hsv;
  if (!hsv.h || !hsv.s || !hsv.v) {
    return null;
  }

  const angle = -hsv.h / 180 * Math.PI;
  return ({
    x: (Math.cos(angle) * hsv.s / 100 + 1) * canvasRef.current.width / 2,
    y: (Math.sin(angle) * hsv.s / 100 + 1) * canvasRef.current.height / 2,
    value: hsv.v});
  } catch {
    return null;
  }
}

function draw(context, w, h, value) {
  const imageData = context.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let x = 0; x < imageData.width; x++) for (let y = 0; y < imageData.height; y++) {
    const offset = 4 * (y * imageData.width + x);
    const dx = (x - imageData.width / 2) / imageData.width * 2;
    const dy = (y - imageData.height / 2) / imageData.height * 2;
    const saturation = Math.sqrt(dx * dx + dy * dy);

    if (saturation > 1) {
      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
      data[offset + 3] = 255;
      continue;
    }

    const hue = -Math.atan2(dy, dx) * 180 / Math.PI;
    data[offset] = fastConvert(hue, saturation, value / 100, 5);
    data[offset + 1] = fastConvert(hue, saturation, value / 100, 3);
    data[offset + 2] = fastConvert(hue, saturation, value / 100, 1);
    data[offset + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);
}

const ColorSelector = props => {
  const [value, setValue] = React.useState(100);
  const [selectedColor, setSelectedColor] = React.useState("#ffffff");
  const [text, setText] = React.useState("#ffffff");
  const [mouseDown, setMouseDown] = React.useState(false);
  const [position, setPosition] = React.useState({x: 0, y: 0});

  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.widgth = Math.min(rect.width, rect.height);
    canvas.height = Math.min(rect.width, rect.height);

    const context = canvas.getContext("2d");
    
    draw(context, canvas.width, canvas.height, value);
    drawMarkers(context);
  }, [canvasRef]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    draw(context, canvas.width, canvas.height, value);
    selectColor(position.x, position.y);
    drawMarkers(context);
  }, [position])

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    draw(context, canvas.width, canvas.height, value);
    drawMarkers(context);
  }, [props.topColors])

  function drawColorMarker(ctx, x, y, color, size) {    
    ctx.save();
    ctx.fillStyle=chromatism.convert(color).hex;
    ctx.beginPath();
    ctx.arc(x, y, size+1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'white';
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.arc(x, y, size+1, 0, 2 * Math.PI);
    ctx.stroke();
  }

  const selectColor = (x, y) => {
    const ctx = canvasRef.current.getContext("2d");
    const pixel = ctx.getImageData(x, y, 1, 1);
    const newColor = chromatism.convert({
      r: pixel.data[0],
      g: pixel.data[1],
      b: pixel.data[2]
    }).hex;
    setSelectedColor(newColor);
    setText(newColor);
  };

  const OnMove = (x, y) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = (x - rect.left) / rect.width * canvas.width;
    const canvasY = (y - rect.top) / rect.height * canvas.height;

    setPosition({ x: canvasX, y: canvasY });
  }

  const onValueChange = (event, newValue) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    draw(context, canvas.width, canvas.height, newValue);
    setValue(newValue);
    selectColor(position.x, position.y);
    drawMarkers(context);
    if (props.onChange) {
      props.onChange(selectedColor);
    }
  };

  const drawMarkers = (context) => {
    for (const color of props.topColors) {
      const position = colorToPosition(canvasRef, color);
      drawColorMarker(context, position.x, position.y, color, 5);
    }
    drawColorMarker(context, position.x, position.y, selectedColor, 6);
  }

  return (
    <div className={props.className}>
      <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="Canvas"
          onMouseDown={e => { setMouseDown(true); OnMove(e.clientX, e.clientY); }}
          onMouseUp={() => {
            setMouseDown(false); 
            if (props.onChange) {
              props.onChange(selectedColor);
            }
          }}
          onMouseMove={e => mouseDown && OnMove(e.clientX, e.clientY)}
          onTouchStart={e => {
            OnMove(e.touches[0].clientX, e.touches[0].clientY);
            if (props.onChange) {
              props.onChange(selectedColor);
            }
          }} />
      <div className="SliderContainer">
          <Slider value={value} onChange={onValueChange} />
      </div>
      <input type="text"
        className="SelectedColor"
        style={{backgroundColor: selectedColor}}
        value={text}
        onChange={e =>
        {
          const position = colorToPosition(canvasRef, e.target.value);
          if (position) {
            setValue(position.value);
            setPosition(position);
          }
          setText(e.target.value);
        }} />
      </div>
      )};

  export default ColorSelector;