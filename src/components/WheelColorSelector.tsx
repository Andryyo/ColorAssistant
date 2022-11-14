import { Slider } from '@mui/material';
import MapColorSelector, { IMarker } from './MapColorSelector';
import React from 'react';
import * as culori from 'culori';
import { IColorWithDelta } from './Options';

const fastConvert = (H: number, S: number, V: number, n: number) => {
  const k = (n + H / 60) % 6;
  return (V - V * S * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
};

interface IColorSelectorProps {
  selectedColor: culori.ILabColor;
  onChange: (color: culori.ILabColor) => void;
  topColors: IColorWithDelta[];
  style: React.CSSProperties;
  active: boolean;
}

const ColorSelector = (props : IColorSelectorProps) => {
  const [value, setValue] = React.useState(100);
  const [imgSrc, setImgSrc] = React.useState<string>(null);
  const [imgCanvas, setImgCanvas] = React.useState<OffscreenCanvas>(null);

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
    void canvas.convertToBlob().then((blob) => setImgSrc(URL.createObjectURL(blob)));
  }, [value]);

  React.useEffect(() => {
    setValue(Math.round(culori.hsv(props.selectedColor).v * 100));
  }, [props.selectedColor]);

  const selectColorByPosition = (x: number, y: number) => {
    const ctx = imgCanvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1);

    if (pixel.data[3] === 0) {
      return;
    }

    const newColor = culori.formatHex({
      mode: 'rgb' as const,
      r: pixel.data[0] / 255,
      g: pixel.data[1] / 255,
      b: pixel.data[2] / 255
    });
    if (props.onChange) {
      props.onChange(culori.lab65(newColor));
    }
  };

  const selectColor = (color: string) => {
    try {
      setValue(Math.round(culori.hsv(color).v));
      if (props.onChange) {
        props.onChange(culori.lab65(color));
      }
      // eslint-disable-next-line no-empty
    } catch {}
  };

  const onValueChanging = (event, newValue : number) => {
    /*const color = culori.hsv(props.selectedColor);
    const newColor = culori.formatHex({
      mode: 'hsv',
      h: color.h || 0,
      s: color.s,
      v: newValue / 100
    });*/

    setValue(newValue);
  };

  const onValueChanged = (event, newValue : number) => {
    const color = culori.hsv(props.selectedColor);
    const newColor = culori.formatHex({
      mode: 'hsv',
      h: color.h || 0,
      s: color.s,
      v: newValue / 100
    });

    setValue(newValue);

    if (props.onChange) {
      props.onChange(culori.lab65(newColor));
    }
  };

  const colorToPosition = (color : culori.ILabColor) => {
    try {
      const hsv = culori.hsv(color);

      const angle = (-(hsv.h || 0) / 180) * Math.PI;
      return {
        x:
          (((Math.cos(angle) * hsv.s * imgCanvas.width) / 2) * value) / 100 +
          imgCanvas.width / 2,
        y:
          (((Math.sin(angle) * hsv.s * imgCanvas.height) / 2) * value) / 100 +
          imgCanvas.height / 2,
        value: hsv.v * 100
      };
    } catch (err) {
      return null;
    }
  };

  let markers : IMarker[] = null;

  if (props.topColors) {
    markers = props.topColors
      .slice(0, 10)
      .map((c) => {
        const pos = colorToPosition(c.color);
        if (pos) {
          return {
            x: pos.x,
            y: pos.y,
            selected: false,
            ...c
          };
        } else {
          return null;
        }
      })
      .filter((m) => m);
  }

  if (props.selectedColor) {
    const pos = colorToPosition(props.selectedColor);
    if (pos) {
      markers.push({
        x: pos.x,
        y: pos.y,
        hex: culori.formatHex(props.selectedColor),
        selected: true
      });
    }
  }

  markers = [...new Map(markers.map((m) => [m.color, m])).values()];
  markers.sort((a, b) => a.delta - b.delta);

  return (
    <div className="ColorWheelContainer" style={props.style}>
      <MapColorSelector
        style={{ flex: '1', minHeight: 0, width: '100%' }}
        src={imgSrc}
        imgHeight={imgCanvas?.height}
        imgWidth={imgCanvas?.width}
        markers={markers}
        topColor={props.topColors && props.topColors[0]}
        click={(e) => selectColorByPosition(e.x, e.y)}
        markerSelected={(m: IMarker) => {
          selectColor(m.hex);
        }}
        active={props.active}
      />
      <div className="SliderContainer">
        <Slider
          value={value}
          onChange={onValueChanging}
          onChangeCommitted={onValueChanged}
          max={100}
        />
      </div>
    </div>
  );
};

export default ColorSelector;
