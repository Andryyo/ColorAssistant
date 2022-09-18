import './App.css';
import React from 'react';
import Card from '@mui/material/Card';
import ColorTable from 'ColorTable';
import ColorSelector from 'ColorSelector';

function App() {
  const [selectedColor, setSelectedColor] = React.useState(null);

  return (
    <div className="App">
      <Card className="ColorTable">
        <ColorTable selectedColor={selectedColor} />
      </Card>
      <Card className="ColorContainer">
        <ColorSelector onChange={e => setSelectedColor(e)} />
      </Card>
    </div>
  );
}

export default App;
