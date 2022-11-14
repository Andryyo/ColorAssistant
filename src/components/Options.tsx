/* eslint-disable react/prop-types */
import { Box, Button, Slider } from '@mui/material';
import { ILabColor } from 'culori';
import fileDownload from 'js-file-download';
import React from 'react';

export interface IColor {
  color: ILabColor,
  collection: string,
  name: string,
  hex: string,
  owned: boolean,
  bases?: IColor[],
}

export interface IDeltaOptions {
  farMixPenalty: number
}

export interface IOptionsProps {
  style: React.CSSProperties,
  colors: IColor[],
  deltaOptions: IDeltaOptions,
  deltaOptionsChanged: (deltaOptions: IDeltaOptions) => void
  updateOwned: (color: IColor) => void,
  transformationColorsNumberChanged: (number: number) => void
}

const Options = (props: IOptionsProps) => {
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [transformationColorsNumber, setTransformationColorsNumber] =
    React.useState(
      () =>{
        const item = localStorage.getItem('transformationColorsNumber');
        if (item) {
          return parseInt(item, 10) || 16
        }
        return 16;
      }
    );

  const onExport = () => {
    const data = JSON.stringify(
      props.colors
        .filter((c) => c.owned && (!c.bases || c.bases.length === 0))
        .map((c) => c.collection + ' ' + c.name + ' ' + c.hex)
    );

    fileDownload(data, 'ColorAssistantExport.json');
  };

  const onFileLoad = (value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: string[] = JSON.parse(value);
      for (const entry of data) {
        const color = props.colors
          .filter((c) => !c.bases || c.bases.length === 0)
          .find((c) => {
            const name = c.collection + ' ' + c.name + ' ' + c.hex;
            return name.includes(entry);
          });

        if (props.updateOwned && color) {
          color.owned = true;
          props.updateOwned(color);
        }
      }
  };

  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = (e) => {
      if (e.target) {
        onFileLoad(e.target.result as string);
      }
    }
  };

  React.useEffect(() => {
    if (props.transformationColorsNumberChanged) {
      props.transformationColorsNumberChanged(transformationColorsNumber);
    }
  }, [transformationColorsNumber, props]);

  const transformationColorsNumberChanged = (v: number) => {
    localStorage.setItem('transformationColorsNumber', v.toString());
    setTransformationColorsNumber(v);
  };

  return (
    <Box style={props.style} sx={{ display: 'flex', flexDirection: 'column' }}>
      <input
        ref={fileInput}
        type="file"
        onChange={onImport}
        style={{ display: 'none' }}
      />
      <Button onClick={() => {
        if (fileInput.current) {
          fileInput.current.click()
        }
        }}>
        Import owned colors
      </Button>
      <Button onClick={onExport}>Export owned colors</Button>
      Palette size
      <Slider
        sx={{ mr: 2, ml: 2, width: 'auto' }}
        value={transformationColorsNumber}
        min={2}
        max={32}
        marks
        onChange={(e, value) =>
          {
            if (typeof value === "number")
            {
              transformationColorsNumberChanged(value);
            }
          }
        }
      />
      Far mix penalty
      <Slider
        sx={{ mr: 2, ml: 2, width: 'auto' }}
        value={props.deltaOptions.farMixPenalty}
        onChange={(e, value) => {
          if (props.deltaOptionsChanged && typeof value === "number") {
            props.deltaOptionsChanged({
              ...props.deltaOptions,
              farMixPenalty: value
            });
          }
        }}
        min={0}
        max={0.2}
        marks
        step={0.01}
      />
    </Box>
  );
};

export default Options;
