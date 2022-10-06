import './App.css';
import React from 'react';
import Card from '@mui/material/Card';
import ColorTable from 'ColorTable';
import ColorSelector from 'WheelColorSelector';
import Picture from 'PictureColorSelector';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function App() {
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [topColors, setTopColors] = React.useState([]);
  const [selectedTab, setSelectedTab] = React.useState(1);

  const [colorsWorker, setColorsWorker] = React.useState(null);

  const [opencvWorker, setOpencvWorker] = React.useState(null);

  React.useEffect(() => {
    console.log('Creating workers');

    const cw = new Worker(process.env.PUBLIC_URL + '/colorsWorker.js');
    const cvw = new Worker(process.env.PUBLIC_URL + '/opencvWorker.js');

    setColorsWorker(cw);
    setOpencvWorker(cvw);

    return function cleanup() {
      console.log('Cleanup', cw, cvw);
      cw?.terminate();
      cvw?.terminate();
    };
  }, []);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} xl={8}>
        <Card className="ColorTable" sx={{ p: 1, height: '90vh' }}>
          {colorsWorker && (
            <ColorTable
              selectedColor={selectedColor}
              onTopColorsChange={(e) => setTopColors(e)}
              worker={colorsWorker}
            />
          )}
        </Card>
      </Grid>
      <Grid item xs={12} xl={4}>
        <Card className="ColorContainer" sx={{ p: 1, height: '90vh' }}>
          <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)}>
            <Tab label="Color Wheel" />
            <Tab label="Picture" />
          </Tabs>
          {selectedTab === 0 && (
            <ColorSelector
              onChange={(e) => setSelectedColor(e)}
              topColors={topColors}
            />
          )}
          {selectedTab === 1 && opencvWorker && (
            <Picture
              onChange={(e) => setSelectedColor(e)}
              topColors={topColors}
              worker={opencvWorker}
            />
          )}
        </Card>
      </Grid>
    </Grid>
  );
}

export default App;
