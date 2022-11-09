/* eslint-disable react/prop-types */
import { Box, Button, Slider, TextField } from '@mui/material';
import fileDownload from 'js-file-download';
import React from 'react';

const Options = (props) => {
  const fileInput = React.useRef(null);
  const [transformationColorsNumber, setTransformationColorsNumber] =
    React.useState(
      () =>
        parseInt(localStorage.getItem('transformationColorsNumber'), 10) || 16
    );

  const onExport = () => {
    const data = JSON.stringify(
      props.colors
        .filter((c) => c.owned && (!c.bases || c.bases.length === 0))
        .map((c) => c.collection + ' ' + c.name + ' ' + c.hex)
    );

    fileDownload(data, 'ColorAssistantExport.json');
  };

  const onImport = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], 'UTF-8');
    fileReader.onload = (e) => {
      const data = JSON.parse(e.target.result);
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
  };

  React.useEffect(() => {
    if (props.transformationColorsNumberChanged) {
      props.transformationColorsNumberChanged(transformationColorsNumber);
    }
  }, [transformationColorsNumber]);

  const transformationColorsNumberChanged = (v) => {
    localStorage.setItem('transformationColorsNumber', v);
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
      <Button onClick={() => fileInput.current.click()}>
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
        onChange={(e, value) => transformationColorsNumberChanged(value)}
      />
      <Box>
        <TextField
          label="Close mix coefficient"
          value={props.deltaOptions.closeMix}
          onChange={(e) => {
            if (props.deltaOptionsChanged) {
              props.deltaOptionsChanged({
                ...props.deltaOptions,
                closeMix: e.target.value
              });
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default Options;
