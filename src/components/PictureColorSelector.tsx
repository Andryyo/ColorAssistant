import React from 'react';
import { Button } from '@mui/material';
import MapColorSelector from './MapColorSelector';
import * as culori from 'culori';
import { db, IGalleryItem } from '../db/db';
import { IColor } from './Options'

interface IPictureProps {
  onChange: (color: culori.ILabColor) => void;
  worker: Worker;
  src: IGalleryItem;
  selectedColor: culori.ILabColor;
  style: React.CSSProperties;
  topColors: IColor[];
  active: boolean;
}

interface IPaletteColor {
  color: culori.IRgbColor | string,
  weight: number
}

interface IKmeansMessage {
  type: 'kmeans',
  data: ImageData,
  colors?: IPaletteColor[] 
}

interface IExtractMessage {
  type: 'extract',
  data: ImageData
}

const Picture = (props : IPictureProps) => {
  const [selectedPosition, setSelectedPosition] = React.useState<{x: number, y: number}>(null);
  const [paletteColors, setPaletteColors] = React.useState<IPaletteColor[]>([]);
  const [imgCanvas, setImgCanvas] = React.useState<OffscreenCanvas>(null);
  const [imgSrc, setImgSrc] = React.useState<string>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const selectColor = (x: number, y: number) => {
    const ctx = imgCanvas.getContext('2d');
    const pixel = ctx.getImageData(x, y, 1, 1);

    if (pixel.data[3] === 0) {
      return;
    }

    const newColor = {
      mode: 'rgb' as const,
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

    props.worker.onmessage = (message: MessageEvent<IKmeansMessage>) => {
      const data = message.data; 
      if (data.type === 'kmeans') {
        newCtx.putImageData(data.data, 0, 0);
        imgCanvas
          .getContext('2d')
          .drawImage(newCanvas, 0, 0, imgCanvas.width, imgCanvas.height);

        void imgCanvas
          .convertToBlob()
          .then((blob) => setImgSrc(URL.createObjectURL(blob)));

        const map = new Map<string, IPaletteColor>();
        data.colors.forEach((item) => {
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
        setPaletteColors(colors);
      }
    };
  };

  const extract = () => {
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

    props.worker.postMessage({ type: 'extract', data: newData });

    props.worker.onmessage = (message: MessageEvent<IExtractMessage>) => {
      const data = message.data; 
      if (data.type === 'extract') {
        newCtx.putImageData(data.data, 0, 0);
        imgCanvas
          .getContext('2d')
          .clearRect(0, 0, imgCanvas.width, imgCanvas.height)
        imgCanvas
          .getContext('2d')
          .drawImage(newCanvas, 0, 0, imgCanvas.width, imgCanvas.height);

        void imgCanvas
          .convertToBlob()
          .then((blob) => setImgSrc(URL.createObjectURL(blob)));
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

    void db.gallery.add({
      data: data,
      preview: preview
    });
  };

  const loadImage = (src: string) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImgCanvas(canvas);
      void canvas
        .convertToBlob()
        .then((blob) => setImgSrc(URL.createObjectURL(blob)));
    };
  };

  const boxzoomend = (x1: number, y1: number, x2: number, y2: number) => {
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

    void canvas.convertToBlob().then((blob) => setImgSrc(URL.createObjectURL(blob)));
  };

  const markers = [];

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
        click={(position) => selectColor(position.x, position.y)}
        markers={markers}
        topColor={props.topColors && props.topColors[0]}
        boxzoomend={boxzoomend}
        active={props.active}
      />
      <div className="ColorsContainer">
        {paletteColors.map((c) => (
          <div
            key={c.color as string}
            style={{
              height: '5vmin',
              backgroundColor: c.color as string,
              flexGrow: c.weight,
              minWidth: '2vmin'
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
            extract();
          }}
        >
          Extract
        </Button>
        <Button
          style={{ flex: '0 0 auto' }}
          onClick={() => {
            void saveToGallery();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default Picture;
