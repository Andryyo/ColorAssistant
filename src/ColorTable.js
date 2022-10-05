/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import * as chromatism from 'chromatism';
import { AgGridReact } from 'ag-grid-react';
import CollectionsFilter from 'CollectionsFilter';
import OwnedFloatingFilter from 'OwnedFloatingFilter';

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const ColorTable = (props) => {
  const [colorsWithDelta, setColorsWithDelta] = React.useState([]);

  React.useEffect(() => {
    props.worker.onmessage = (message) => {
      if (message.data.type === 'init') {
        console.log('Colors loaded');
        setColorsWithDelta(message.data.colors);
      }
    };

    const ownedColors = JSON.parse(localStorage.getItem('ownedColors'));
    props.worker.postMessage({ type: 'init', ownedColors: ownedColors });
  }, []);

  React.useEffect(() => {
    props.worker.onmessage = (message) => {
      if (message.data.type === 'updateSelectedColor') {
        setColorsWithDelta(message.data.colors);
      }
    };

    props.worker.postMessage({
      type: 'updateSelectedColor',
      selectedColor: props.selectedColor
    });
  }, [props.selectedColor]);

  const columns = React.useMemo(
    () => [
      {
        field: 'collection',
        headerName: 'Collection',
        width: 100,
        filter: CollectionsFilter,
        wrapText: true
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
        sortable: true,
        filter: true,
        floatingFilter: true,
        wrapText: true
      },
      {
        valueGetter: (props) => {
          return {
            color: props.data.id,
            bases: props.data.bases
          };
        },
        headerName: 'Code',
        width: 200,
        sortable: true,
        filter: true,
        cellRenderer: (props) => {
          if (props.value.bases) {
            return (
              <div style={{ display: 'flex', height: '100%' }}>
                <div
                  style={{ backgroundColor: props.value.bases[0] }}
                  className="MiniColorCell"
                ></div>
                <div
                  style={{ backgroundColor: props.value.color }}
                  className="ColorCell"
                >
                  {props.value.color}
                </div>
                <div
                  style={{ backgroundColor: props.value.bases[1] }}
                  className="MiniColorCell"
                ></div>
              </div>
            );
          } else {
            return (
              <div
                style={{ backgroundColor: props.value.color }}
                className="ColorCell"
              >
                {props.value.color}
              </div>
            );
          }
        }
      },
      {
        field: 'H',
        headerName: 'Hue',
        width: 75,
        sortable: true,
        filter: 'agNumberColumnFilter'
      },
      {
        field: 'S',
        headerName: 'Saturation',
        width: 75,
        sortable: true,
        filter: 'agNumberColumnFilter'
      },
      {
        field: 'V',
        headerName: 'Value',
        width: 75,
        sortable: true,
        filter: 'agNumberColumnFilter'
      },
      {
        field: 'owned',
        headerName: 'Owned',
        width: 75,
        sortable: true,
        filter: true,
        floatingFilter: true,
        floatingFilterComponent: OwnedFloatingFilter,
        cellRenderer: (props) => {
          return (
            <input
              type="checkbox"
              defaultChecked={props.value}
              onChange={(e) => {
                props.node.setDataValue(props.column, e.target.checked);
              }}
            />
          );
        }
      },
      {
        field: 'delta',
        headerName: 'Delta',
        width: 100,
        sortable: true,
        filter: 'agNumberColumnFilter',
        sort: 'asc',
        sortingOrder: ['asc']
      },
      {
        field: 'minDelta',
        headerName: 'Min Delta',
        width: 100,
        sortable: true,
        filter: 'agNumberColumnFilter'
      }
    ],
    []
  );

  const updateTopColors = () => {
    if (props.onTopColorsChange) {
      let topColors = [];
      tableRef.current.api?.forEachNodeAfterFilterAndSort((node) => {
        topColors.push(node.data.color);
      });
      props.onTopColorsChange(topColors);
    }
  };

  const updateLocalStorage = () => {
    let ownedColors = [];
    tableRef.current.api?.forEachNode((node) => {
      if (node.data.collection !== 'Mix' && node.data.owned) {
        ownedColors.push(node.data.name);
      }
    });
    localStorage.setItem('ownedColors', JSON.stringify(ownedColors));
  };

  const tableRef = React.useRef(null);
  React.useEffect(() => {
    updateTopColors();
  }, [colorsWithDelta]);

  return (
    <AgGridReact
      className="ag-theme-alpine"
      ref={tableRef}
      rowData={colorsWithDelta}
      columnDefs={columns}
      rowHeight={75}
      pagination={true}
      onFilterChanged={updateTopColors}
      onSortChanged={updateTopColors}
      onCellValueChanged={updateLocalStorage}
    />
  );
};

export default ColorTable;
