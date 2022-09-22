import './App.css';
import React from 'react';
import Card from '@mui/material/Card';
import ColorTable from 'ColorTable';
import ColorSelector from 'ColorSelector';
import Grid from '@mui/material/Grid';

function App() {
  const [selectedColor, setSelectedColor] = React.useState(null);
  const [topColors, setTopColors] = React.useState([]);

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} xl={8}>
        <Card className="ColorTable" sx={{ p: 1 }}>
          <ColorTable selectedColor={selectedColor} onTopColorsChange={e => setTopColors(e)}/>
        </Card>
      </Grid>
      <Grid item xs={12} xl={4}>
        <Card className="ColorContainer" sx={{ p: 1 }}>
          <ColorSelector onChange={e => setSelectedColor(e)} topColors={topColors}/>
        </Card>
      </Grid>
    </Grid>
  );
}

export default App;
