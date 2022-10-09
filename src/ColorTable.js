/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import CollectionsFilter from 'CollectionsFilter';
import OwnedFloatingFilter from 'OwnedFloatingFilter';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import * as culori from 'culori';

const difference = culori.differenceCiede2000();

const ColorTable = (props) => {
  const [progress, setProgress] = React.useState(0);
  const tableRef = React.useRef(null);
  const [colors, setColors] = React.useState(null);

  React.useEffect(() => {
    props.worker.onmessage = (message) => {
      if (message.data.type === 'colorsUpdated') {
        setColors(message.data.colors);
      } else if (message.data.type === 'progressUpdate') {
        if (message.data.value === 100) {
          tableRef.current?.api?.hideOverlay();
        } else {
          setProgress(message.data.value);
          tableRef.current?.api?.showLoadingOverlay();
        }
      }
    };
  }, [props.worker]);

  React.useEffect(() => {
    if (props.selectedColor) {
      props.worker.postMessage({
        type: 'updateSelectedColor',
        selectedColor: props.selectedColor
      });
    }
  }, [props.selectedColor]);

  const colorsWithDelta = React.useMemo(() => {
    return colors?.map((c) => {
      const delta = props.selectedColor
        ? Math.round(difference(c.color, props.selectedColor))
        : null;
      return { ...c, delta: delta };
    });
  }, [colors, props.selectedColor]);

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
            color: props.data.hex,
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
                  style={{ backgroundColor: props.value.bases[0][2] }}
                  className="MiniColorCell"
                ></div>
                <div
                  style={{ backgroundColor: props.value.color }}
                  className="ColorCell"
                >
                  {props.value.color}
                </div>
                <div
                  style={{ backgroundColor: props.value.bases[1][2] }}
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
              disabled={props.data.collection === 'Mix'}
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
        width: 50,
        sortable: true,
        filter: 'agNumberColumnFilter',
        sort: 'asc',
        sortingOrder: ['asc']
      },
      {
        field: 'minDelta',
        headerName: 'Min Delta',
        width: 50,
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
        topColors.push(node.data);
      });
      props.onTopColorsChange(topColors);
    }
  };

  const onCellValueChanged = (e) => {
    props.worker.postMessage({
      type: 'updateOwned',
      color: e.data,
      selectedColor: props.selectedColor
    });
  };

  React.useEffect(() => {
    updateTopColors();
  }, [colorsWithDelta]);

  const progressOverlay = (props) => {
    return (
      <div
        className="ag-overlay-loading-center"
        style={{ backgroundColor: 'lightsteelblue', height: '9%' }}
      >
        <i className="far fa-frown"> Loading: {props.progress}%</i>
      </div>
    );
  };

  return (
    <AgGridReact
      className="ag-theme-material"
      ref={tableRef}
      rowData={colorsWithDelta}
      columnDefs={columns}
      rowHeight={75}
      pagination={true}
      onFilterChanged={updateTopColors}
      onSortChanged={updateTopColors}
      onCellValueChanged={(e) => onCellValueChanged(e)}
      loadingOverlayComponent={progressOverlay}
      loadingOverlayComponentParams={{ progress: progress }}
      enableCellTextSelection={true}
      getRowId={(r) => r.data.collection + ' ' + r.data.name + ' ' + r.data.hex}
    />
  );
};

export default ColorTable;
