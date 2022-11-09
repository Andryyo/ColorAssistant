/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import CollectionsFilter from './CollectionsFilter';
import OwnedFloatingFilter from './OwnedFloatingFilter';
import * as culori from 'culori';

const difference = culori.differenceCiede2000();

const ColorTable = (props) => {
  const tableRef = React.useRef(null);

  const colorsWithDelta = React.useMemo(() => {
    const result = props.colors?.map((c) => {
      const delta = props.selectedColor
        ? difference(c.color, props.selectedColor)
        : null;
      let adjustedDelta = delta;
      if (props.deltaOptions) {
        let basesDiff = 0;
        if (c.bases?.length > 0) {
          basesDiff = difference(c.bases[0].color, c.bases[1].color);
        }
        adjustedDelta = delta + props.deltaOptions.closeMix * basesDiff;
      }
      return { ...c, delta: delta, adjustedDelta: adjustedDelta };
    });

    return result;
  }, [props.colors, props.selectedColor, props.deltaOptions]);

  React.useEffect(() => {
    if (props.loading) {
      tableRef.current?.api?.showLoadingOverlay();
    } else {
      tableRef.current?.api?.hideOverlay();
    }
  }, [props.loading]);

  const collections = React.useMemo(() => {
    if (!colorsWithDelta) {
      return new Set();
    }

    const result = new Set(colorsWithDelta.map((c) => c.collection));
    result.add('Mix');
    return result;
  }, [colorsWithDelta]);

  const columns = React.useMemo(
    () => [
      {
        field: 'collection',
        headerName: 'Collection',
        width: 100,
        filter: CollectionsFilter,
        filterParams: { options: collections, colors: props.colors },
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
        valueGetter: (p) => {
          return {
            collection: p.data?.collection,
            color: p.data?.hex,
            bases: p.data?.bases
          };
        },
        headerName: 'Code',
        width: 200,
        filter: true,
        cellRenderer: (props) => {
          if (props.value.collection === 'Mix') {
            return (
              <div style={{ display: 'flex', height: '100%' }}>
                <div
                  style={{ backgroundColor: props.value.bases[0].hex }}
                  className="MiniColorCell"
                ></div>
                <div
                  style={{ backgroundColor: props.value.color }}
                  className="ColorCell"
                >
                  {props.value.color}
                </div>
                <div
                  style={{ backgroundColor: props.value.bases[1].hex }}
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
        field: 'owned',
        headerName: 'Owned',
        width: 75,
        filter: true,
        floatingFilter: true,
        floatingFilterComponent: OwnedFloatingFilter,
        cellRenderer: (props) => {
          return (
            <input
              type="checkbox"
              defaultChecked={props.value}
              disabled={props.data?.collection === 'Mix'}
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
        width: 75,
        sortable: true,
        sortingOrder: ['asc']
      },
      {
        field: 'adjustedDelta',
        headerName: 'Adjusted Delta',
        width: 75,
        sortable: true,
        sort: 'asc',
        sortingOrder: ['asc']
      },
      {
        field: 'minDelta',
        headerName: 'Missing in collection',
        width: 50,
        sortable: true
      },
      {
        headerName: 'L',
        width: 75,
        sortable: true,
        valueGetter: (p) => p.data?.color.l
      },
      {
        headerName: 'Saturation',
        width: 75,
        sortable: true,
        valueGetter: (p) =>
          p.data?.color && Math.hypot(p.data.color.a, p.data.color.b)
      }
    ],
    [collections]
  );

  const onCellValueChanged = (e) => {
    if (props.updateOwned) {
      props.updateOwned(e.data);
    }
  };

  const updateTopColors = () => {
    if (props.onTopColorsChange) {
      let topColors = [];
      tableRef.current.api?.forEachNodeAfterFilterAndSort((node) => {
        topColors.push(node.data);
      });
      props.onTopColorsChange(topColors);
    }
  };

  React.useEffect(() => {
    updateTopColors();
  }, [colorsWithDelta]);

  return (
    <AgGridReact
      className="ag-theme-material"
      ref={tableRef}
      columnDefs={columns}
      rowHeight={75}
      onCellValueChanged={(e) => onCellValueChanged(e)}
      enableCellTextSelection={true}
      rowData={colorsWithDelta}
      getRowId={(r) => r.data.collection + ' ' + r.data.name + ' ' + r.data.hex}
      onFilterChanged={updateTopColors}
      onSortChanged={updateTopColors}
    />
  );
};

export default ColorTable;
