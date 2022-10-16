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
  const [selectedColor, setSelectedColor] = React.useState('#ffffff');
  const [topColors, setTopColors] = React.useState([]);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [colorsWorker, setColorsWorker] = React.useState(null);
  const [opencvWorker, setOpencvWorker] = React.useState(null);

  React.useEffect(() => {
    console.log('Creating workers');

    const cw = new Worker(new URL('./colorsWorker.js', import.meta.url));
    const cvw = new Worker(new URL('./opencvWorker.js', import.meta.url));

    setColorsWorker(cw);
    setOpencvWorker(cvw);

    return function cleanup() {
      cw.terminate();
      cvw.terminate();
    };
  }, []);

  const [width, setWidth] = React.useState(window.innerWidth);
  const breakpoint = 620;

  React.useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleWindowResize);

    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const table = (active) => (
    <div
      style={active ? { width: '100%', height: '100%' } : { display: 'none' }}
    >
      <ColorTable
        selectedColor={selectedColor}
        onTopColorsChange={(e) => setTopColors(e)}
        worker={colorsWorker}
      />
    </div>
  );

  const colorWheel = (active) => (
    <ColorSelector
      onChange={(e) => setSelectedColor(e)}
      selectedColor={selectedColor}
      topColors={topColors}
      style={active ? null : { display: 'none' }}
      active={active}
    />
  );

  const picture = (active) => (
    <Picture
      onChange={(e) => setSelectedColor(e)}
      selectedColor={selectedColor}
      topColors={topColors}
      worker={opencvWorker}
      style={active ? null : { display: 'none' }}
      active={active}
    />
  );

  return (
    <Grid container spacing={1}>
      {width > breakpoint ? (
        <>
          <Grid item xs={8}>
            <Card className="ColorTable" sx={{ p: 1, height: '90vh' }}>
              {table(true)}
            </Card>
          </Grid>
          <Grid item xs={4}>
            <Card className="ColorContainer" sx={{ p: 1, height: '90vh' }}>
              <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)}>
                <Tab label="Color Wheel" />
                <Tab label="Picture" />
              </Tabs>
              {colorWheel(selectedTab === 0)}
              {picture(selectedTab === 1)}
            </Card>
          </Grid>
        </>
      ) : (
        <>
          <Grid item>
            <Card className="ColorContainer" sx={{ p: 1, height: '90vh' }}>
              <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)}>
                <Tab label="Colors" />
                <Tab label="Color Wheel" />
                <Tab label="Picture" />
              </Tabs>
              {table(selectedTab === 0)}
              {colorWheel(selectedTab === 1)}
              {picture(selectedTab === 2)}
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
}

export default App;
