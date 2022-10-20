import React from 'react';
import Card from '@mui/material/Card';
import ColorTable from 'ColorTable';
import ColorSelector from 'WheelColorSelector';
import Picture from 'PictureColorSelector';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Options from 'Options';
import { ColorsMessage } from 'ColorsMessage';

const ColorsContainer = () => {
  const [selectedColor, setSelectedColor] = React.useState('#ffffff');
  const [topColors, setTopColors] = React.useState([]);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [colorsWorker, setColorsWorker] = React.useState(null);
  const [opencvWorker, setOpencvWorker] = React.useState(null);
  const [colors, setColors] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  function initColorsWorker() {
    const cw = new Worker(new URL('./colorsWorker.js', import.meta.url));

    cw.onmessage = (message) => {
      if (message.data.type === 'colorsUpdated') {
        try {
          const rawColors = ColorsMessage.decode(message.data.data).colors;
          const colors = rawColors.map((c) => {
            if (c.bases?.length > 0) {
              const ratios = [
                { value: 0.25, name: '3 to 1' },
                { value: 0.5, name: '1 to 1' },
                { value: 0.75, name: '1 to 3' }
              ];

              const name =
                rawColors[c.bases[0]].collection +
                ' ' +
                rawColors[c.bases[0]].name +
                ' + ' +
                rawColors[c.bases[1]].collection +
                ' ' +
                rawColors[c.bases[1]].name +
                ' ' +
                ratios.find((r) => r.value === c.ratio)?.name;

              return { ...c, name: name, collection: 'Mix' };
            } else {
              return c;
            }
          });

          setColors(colors);
        } catch (err) {
          console.log(err);
        }
      } else if (message.data.type === 'progressUpdate') {
        if (message.data.value === 100) {
          setLoading(false);
        } else {
          setLoading(true);
        }
      }
    };

    setColorsWorker(cw);
    return cw;
  }

  const updateOwned = (color) => {
    colorsWorker.postMessage({
      type: 'updateOwned',
      color: color
    });
  };

  React.useEffect(() => {
    console.log('Creating workers');

    const cw = initColorsWorker();

    const cvw = new Worker(new URL('./opencvWorker.js', import.meta.url));
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
        loading={loading}
        colors={colors}
        updateOwned={updateOwned}
      />
    </div>
  );

  const colorWheel = (active) => (
    <ColorSelector
      onChange={(e) => setSelectedColor(e)}
      selectedColor={selectedColor}
      topColors={topColors}
      colors={colors}
      style={active ? null : { display: 'none' }}
      active={active}
    />
  );

  const picture = (active) => (
    <Picture
      onChange={(e) => setSelectedColor(e)}
      selectedColor={selectedColor}
      topColors={topColors}
      colors={colors}
      worker={opencvWorker}
      style={active ? null : { display: 'none' }}
      active={active}
    />
  );

  const options = (active) => (
    <Options
      style={active ? null : { display: 'none' }}
      colors={colors}
      updateOwned={updateOwned}
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
                <Tab label="Options" />
              </Tabs>
              {colorWheel(selectedTab === 0)}
              {picture(selectedTab === 1)}
              {options(selectedTab === 2)}
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
                <Tab label="Options" />
              </Tabs>
              {table(selectedTab === 0)}
              {colorWheel(selectedTab === 1)}
              {picture(selectedTab === 2)}
              {options(selectedTab === 3)}
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ColorsContainer;
