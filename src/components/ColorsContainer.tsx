import React from 'react';
import Card from '@mui/material/Card';
import ColorTable from './ColorTable';
import ColorSelector from './WheelColorSelector';
import GradientColorSelector from './GradientColorSelector'
import Picture from './PictureColorSelector';
import SelectedColor from './SelectedColor';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Options, { IColor, IMixColor } from './Options';
import { ColorsMessage } from '../db/ColorsMessage';
import Gallery from './Gallery';
import { IGalleryItem } from 'db/db';
import * as culori from 'culori'
import { IColorsUpdateMessage, IProgressUpdateMessage, ICompactColor } from 'workers/colorsWorker';

const ColorsContainer = () => {
  const [selectedColor, setSelectedColor] = React.useState(culori.lab65('#ffffff'));
  const [topColors, setTopColors] = React.useState([]);
  const [selectedTab, setSelectedTab] = React.useState('colorWheel');
  const [colorsWorker, setColorsWorker] = React.useState<Worker>(null);
  const [opencvWorker, setOpencvWorker] = React.useState<Worker>(null);
  const [colors, setColors] = React.useState<IColor[]>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedPicture, setSelectedPicture] = React.useState<IGalleryItem>(null);
  const [transformationColorsNumber, setTransformationColorsNumber] =
    React.useState(16);
  const [deltaOptions, setDeltaOptions] = React.useState({
    farMixPenalty: 0.1
  });

  function initColorsWorker() {
    const cw = new Worker(
      new URL('../workers/colorsWorker.ts', import.meta.url)
    );

    cw.onmessage = (message: MessageEvent<IColorsUpdateMessage | IProgressUpdateMessage>) => {
      const data = message.data;
      if (data.type === 'colorsUpdated') {
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const rawColors : ICompactColor[] = ColorsMessage.decode(data.data).colors;
          const colors = rawColors.map((c : ICompactColor) : (IColor | IMixColor) => {
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

              const bases = [rawColors[c.bases[0]] as IColor, rawColors[c.bases[1]]];

              bases.sort((a, b) => a.color.l - b.color.l);

              const result: IMixColor =  {
                ...c,
                name: name,
                collection: 'Mix',
                bases: bases
              };

              return result;
            } else {
              return c;
            }
          });

          setColors(colors);
        } catch (err) {
          console.log(err);
        }
      } else if (data.type === 'progressUpdate') {
        if (data.value === 100) {
          setLoading(false);
        } else {
          setLoading(true);
        }
      }
    };

    setColorsWorker(cw);
    return cw;
  }

  const updateOwned = React.useCallback(
    (colors: IColor[]) => {
      colorsWorker.postMessage({
        type: 'updateOwned',
        colors: colors
      });
    },
    [colorsWorker]
  );

  React.useEffect(
    () => {
      colorsWorker?.postMessage({
        type: 'updateDeltaOptions',
        deltaOptions: deltaOptions
      })
    },
    [colorsWorker, deltaOptions]
  )

  React.useEffect(() => {
    console.log('Creating workers');

    const cw = initColorsWorker();

    const cvw = new Worker(
      new URL('../workers/opencvWorker.js', import.meta.url)
    );
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

  React.useEffect(() => {
    if (opencvWorker) {
      opencvWorker.postMessage({
        type: 'setTransformationColorsNumber',
        value: transformationColorsNumber
      });
    }
  }, [transformationColorsNumber, opencvWorker]);

  const table = React.useMemo(
    () => (
      <div
        style={
          selectedTab === 'table' || width > breakpoint
            ? { width: '100%', height: '100%' }
            : { display: 'none' }
        }
      >
        <ColorTable
          selectedColor={selectedColor}
          onTopColorsChange={(e) => setTopColors(e)}
          loading={loading}
          colors={colors}
          updateOwned={updateOwned}
          deltaOptions={deltaOptions}
        />
      </div>
    ),
    [
      selectedColor,
      selectedTab,
      loading,
      colors,
      width,
      deltaOptions,
      updateOwned
    ]
  );

  const colorWheel = React.useMemo(
    () => (
      <ColorSelector
        onChange={(e) => setSelectedColor(e)}
        selectedColor={selectedColor}
        topColors={topColors}
        style={selectedTab === 'colorWheel' ? null : { display: 'none' }}
        active={selectedTab === 'colorWheel'}
      />
    ),
    [selectedColor, topColors, colors, selectedTab]
  );

  const picture = React.useMemo(
    () => (
      <Picture
        onChange={(e) => setSelectedColor(e)}
        selectedColor={selectedColor}
        topColors={topColors}
        worker={opencvWorker}
        style={selectedTab === 'picture' ? null : { display: 'none' }}
        active={selectedTab === 'picture'}
        src={selectedPicture}
      />
    ),
    [
      selectedColor,
      topColors,
      colors,
      opencvWorker,
      selectedTab,
      selectedPicture
    ]
  );

  const options = React.useMemo(
    () => (
      <Options
        style={selectedTab === 'options' ? null : { display: 'none' }}
        colors={colors}
        updateOwned={updateOwned}
        transformationColorsNumberChanged={(v) =>
          setTransformationColorsNumber(v)
        }
        deltaOptions={deltaOptions}
        deltaOptionsChanged={(o) => setDeltaOptions(o)}
      />
    ),
    [colors, selectedTab, deltaOptions, updateOwned]
  );

  const gallery = React.useMemo(
    () => (
      <Gallery
        style={selectedTab === 'gallery' ? null : { display: 'none' }}
        selectPicture={(e: IGalleryItem) => {
          setSelectedTab('picture');
          setSelectedPicture(e);
        }}
      />
    ),
    [selectedTab]
  );

  return (
    <Grid container sx={{ height: '100vh' }}>
      {width > breakpoint ? (
        <>
          <Grid item xs={8} sx={{ p: 1, flexGrow: '1', display: 'flex' }}>
            <Card
              className="ColorTable"
              sx={{ display: 'flex', flexGrow: '1' }}
            >
              {table}
            </Card>
          </Grid>
          <Grid
            container
            direction="column"
            item
            xs={4}
            sx={{ p: 1 }}
            spacing={1}
          >
            <Grid
              item
              sx={{ flexGrow: '1', display: 'flex', flexDirection: 'column' }}
            >
              <Card
                sx={{
                  p: 1,
                  flexGrow: '1',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Tabs
                  value={selectedTab}
                  onChange={(e, v: string) => setSelectedTab(v)}
                >
                  <Tab label="Color Wheel" value="colorWheel" />
                  <Tab label="Picture" value="picture" />
                  <Tab label="Gallery" value="gallery" />
                  <Tab label="Options" value="options" />
                </Tabs>
                {colorWheel}
                {picture}
                {gallery}
                {options}
              </Card>
            </Grid>
            <Grid item>
              <Card sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <SelectedColor
                  onChange={(e) => setSelectedColor(e)}
                  selectedColor={selectedColor}
                />
                <GradientColorSelector
                  style={{ height: '5vmin'}}
                  onChange={(e) => setSelectedColor(e)}
                  selectedColor={selectedColor}
                />
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Grid
            container
            item
            direction="column"
            xs={true}
            sx={{ height: '100vh', alignItems: 'stretch' }}
          >
            <Card
              sx={{
                p: 1,
                m: 1,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Tabs
                value={selectedTab}
                onChange={(e, v: string) => setSelectedTab(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ width: '90vw' }}
              >
                <Tab label="Colors" value="table" />
                <Tab label="Color Wheel" value="colorWheel" />
                <Tab label="Picture" value="picture" />
                <Tab label="Gallery" value="gallery" />
                <Tab label="Options" value="options" />
              </Tabs>
              {table}
              {colorWheel}
              {picture}
              {gallery}
              {options}
            </Card>
            <Card sx={{ p: 1, m: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
              <SelectedColor
                onChange={(e) => setSelectedColor(e)}
                selectedColor={selectedColor}
              />
              <GradientColorSelector
                  style={{ height: '5vmin'}}
                  onChange={(e) => setSelectedColor(e)}
                  selectedColor={selectedColor}
                />
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ColorsContainer;
