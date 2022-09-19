/* eslint-disable react/prop-types */

import { Slider } from "@mui/material";
import * as chromatism from "chromatism"
import React from "react";

const fastConvert = (H, S, V, n) => {
const k = (n + H / 60) % 6;
return (V - V * S * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
}

function draw(canvasRef, value) {
  const canvas = canvasRef.current;
  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
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
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [mouseDown, setMouseDown] = React.useState(false);
  const [position, setPosition] = React.useState({x: 0, y: 0});

  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    draw(canvasRef, value);
  }, []);

  const selectColor = (x, y) => {
    console.log(x, y)

    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.stroke();
    const pixel = ctx.getImageData(x, y, 1, 1);
    const newColor = chromatism.convert({
      r: pixel.data[0],
      g: pixel.data[1],
      b: pixel.data[2]
    }).hex;
    setSelectedColor(newColor);

    if (props.onChange) {
      props.onChange(newColor);
    }
  };

  const OnCanvasMove = e => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * canvas.width;
    const y = (e.clientY - rect.top) / rect.height * canvas.height;
    draw(canvasRef, value);
    selectColor(x, y);
    setPosition({ x, y });
  };

  const onValueChange = (event, newValue) => {
    draw(canvasRef, newValue);
    setValue(newValue);
    selectColor(position.x, position.y);
  };

return (<div {...props}>
  <canvas
      ref={canvasRef}
      width={400}
        height={400}
        className="Canvas"
        onMouseDown={e => { setMouseDown(true); OnCanvasMove(e) }}
        onMouseUp={() => setMouseDown(false)}
        onMouseMove={e => mouseDown && OnCanvasMove(e)}/>
        <div className="SliderContainer">
            <Slider value={value} onChange={onValueChange} />
        </div>
        <div className="SelectedColor" style={{backgroundColor: selectedColor}}>
            {selectedColor}
        </div>
    </div>)
  };
  
  export default ColorSelector;