import React from 'react';
import * as culori from 'culori';
import { IColorWithDelta } from './Options';

interface IColorSelectorProps {
  selectedColor: culori.ILabColor;
  onChange: (color: culori.ILabColor) => void;
  topColors?: IColorWithDelta[];
  style?: React.CSSProperties;
}

const GradientColorSelector = (props : IColorSelectorProps) => {
  const canvas = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const context = canvas.current.getContext('2d');
    const imageData = context.createImageData(canvas.current.width, canvas.current.height);
    const data = imageData.data;

    for (let x = 0; x < imageData.width; x++)
    {
      const l = x / imageData.width * 100;
      const newColor = culori.rgb({mode: 'lab65', l, a: props.selectedColor.a, b: props.selectedColor.b});

      for (let y = 0; y < imageData.height; y++) {
        const offset = 4 * (y * imageData.width + x);

        data[offset] = newColor.r * 255;
        data[offset + 1] = newColor.g * 255;
        data[offset + 2] = newColor.b * 255;
        data[offset + 3] = 255;
      }
    }

    context.putImageData(imageData, 0, 0);
    context.beginPath();
    context.arc(props.selectedColor.l / 100 * imageData.width, imageData.height / 2, imageData.height / 8, 0, 2 * Math.PI);
    context.stroke();
  }, [props.selectedColor]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;

    if (props.onChange) {
      props.onChange({mode: 'lab65', l: x * 100, a: props.selectedColor.a, b: props.selectedColor.b});
    }    
  }

  return (
    <div style={{...props.style, display: 'flex'}}>
      <canvas
        height={50}
        width={500}
        ref={canvas}
        style={{ flex: '1', minHeight: 0, width: '100%' }}
        onClick={e => handleClick(e)}
      />
    </div>
  );
};

export default GradientColorSelector;
