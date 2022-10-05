/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import * as chromatism from 'chromatism';
import mixbox from 'mixbox';
import { data as vallejoGame } from 'VallejoGame';
import { data as vallejoModel } from 'VallejoModel';
import { data as citadel } from 'Citadel';
import { data as armyPainter } from 'ArmyPainter';
import { AgGridReact } from 'ag-grid-react';
import CollectionsFilter from 'CollectionsFilter';
import OwnedFloatingFilter from 'OwnedFloatingFilter';

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS
import cielabDifference from 'difference';

const ColorTable = (props) => {
  const createColor = (collection, name, id, owned) => {
    let color, H, S, V;

    if (id === '#000000') {
      H = 0;
      S = 0;
      V = 0;
      color = { L: 0, a: 0, b: 0 };
    } else if (id === '#ffffff') {
      H = 0;
      S = 0;
      V = 100;
      color = { L: 100, a: 0, b: 0 };
    } else {
      const hsv = chromatism.convert(id).hsv;
      H = hsv.h;
      S = hsv.s;
      V = hsv.v;
      color = chromatism.convert(id).cielab;
    }

    return {
      collection: collection,
      name: name,
      id: id,
      color: color,
      H: Math.round(H),
      S: Math.round(S),
      V: Math.round(V),
      owned: owned
    };
  };

  const getCollection = (collection, data, ownedColors) => {
    return data
      .split('\n')
      .filter((s) => s)
      .map((s) => {
        const code = s.substring(s.indexOf('#'));
        const name = s.substring(0, s.indexOf('#') - 1);
        return createColor(
          collection,
          name,
          code,
          ownedColors ? ownedColors.includes(name) : false
        );
      });
  };

  const colors = React.useMemo(() => {
    let colors = [];
    const ownedColors = JSON.parse(localStorage.getItem('ownedColors'));

    let baseColors = [];
    getCollection('Vallejo Game Colors', vallejoGame, ownedColors).forEach(
      (c) => baseColors.push(c)
    );
    getCollection('Vallejo Model Colors', vallejoModel, ownedColors).forEach(
      (c) => baseColors.push(c)
    );
    getCollection('Citadel', citadel, ownedColors).forEach((c) =>
      baseColors.push(c)
    );
    getCollection('Army Painter', armyPainter, ownedColors).forEach((c) =>
      baseColors.push(c)
    );

    baseColors.forEach((c) => colors.push(c));

    for (let color1 of colors) {
      const deltas = colors
        .filter((c) => c !== color1 && c.owned)
        .map((color2) => {
          const delta = Math.round(
            cielabDifference(color1.color, color2.color, 2, 1)
          );
          return delta;
        });
      color1.minDelta = Math.min(...deltas);
    }

    for (let i = 0; i < baseColors.length; i++)
      for (let j = i + 1; j < baseColors.length; j++) {
        const mix = mixbox.lerp(baseColors[i].id, baseColors[j].id, 0.5);
        const code = chromatism.convert({
          r: mix[0],
          g: mix[1],
          b: mix[2]
        }).hex;

        const color = createColor(
          'Mix',
          baseColors[i].name + '+' + baseColors[j].name,
          code,
          ownedColors
            ? ownedColors.includes(baseColors[i].name) &&
                ownedColors.includes(baseColors[j].name)
            : false
        );

        colors.push({
          ...color,
          bases: [baseColors[i].id, baseColors[j].id],
          baseCollections: [baseColors[i].collection, baseColors[j].collection]
        });
      }

    return colors;
  }, []);

  const colorsWithDelta = React.useMemo(() => {
    return colors.map((c) => {
      const delta = props.selectedColor
        ? Math.round(cielabDifference(c.color, props.selectedColor, 2, 1))
        : null;
      return { ...c, delta };
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
  }, [props.selectedColor]);

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
