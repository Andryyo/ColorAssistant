/* eslint-disable react/prop-types */
import React from "react";
import * as chromatism from "chromatism"
import mixbox from 'mixbox';
import { data as vallejoGame } from "VallejoGame"
import { AgGridReact } from "ag-grid-react";

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const ColorTable = props => {
    const colors = React.useMemo(() => {
      let colors = [];
      const ownedColors = JSON.parse(localStorage.getItem("ownedColors"));

      const vallejoColors = vallejoGame.split('\n').map(s => {
        const code = s.substring(s.indexOf("#"));
        const color = chromatism.convert(code).hsv;
        const H = color.h;
        const S = color.s || 0;
        const V = color.v;
        const name = s.substring(0, s.indexOf("#") - 1);
        return {
          collection: "Vallejo Game Color",
          name: name,
          id: code,
          color: chromatism.convert(color).cielab,
          H: Math.round(H),
          S: Math.round(S),
          V: Math.round(V),
          owned: ownedColors ? ownedColors.includes(name) : false,
        };
      });

      vallejoColors.forEach((c) => colors.push(c));

      for (let color1 of colors)
      {
        const deltas = colors.filter(c => c !== color1 && c.owned).map((color2) => Math.round(chromatism.difference(color1.color, color2.color, 2, 1)));
        color1.minDelta = Math.min(...deltas);
      }

      for (let i = 0; i < vallejoColors.length; i++)
      for (let j = i + 1; j < vallejoColors.length; j++)
      {
          const mix = mixbox.lerp(vallejoColors[i].id, vallejoColors[j].id, 0.5);
          const color = chromatism.convert({r: mix[0], g: mix[1], b: mix[2]}).hsv;

          colors.push({
            collection: "Mix",
            name: vallejoColors[i].name + "+" + vallejoColors[j].name,
            id: chromatism.convert(color).hex,
            color: chromatism.convert(color).cielab,
            bases: [vallejoColors[i].id, vallejoColors[j].id],
            H: Math.round(color.h),
            S: Math.round(color.s),
            V: Math.round(color.v),
            owned: ownedColors ? ownedColors.includes(vallejoColors[i].name) && ownedColors.includes(vallejoColors[j].name) : false
          });
      }

      return colors;
    }, []);

    const colorsWithDelta = React.useMemo(() => {
      return colors.map(c => {
        const delta = props.selectedColor ? Math.round(chromatism.difference(c.color, props.selectedColor, 2, 1)) : null;
        return {...c, delta};
      })}, [props.selectedColor]);

    const columns = React.useMemo(() => [{
      field: "collection",
      headerName: "Collection",
      width: 100,
      filter: true,
      wrapText: true,
    }, {
      field: "name",
      headerName: "Name",
      width: 150,
      sortable: true,
      filter: true,
      wrapText: true,
    }, {
      valueGetter: props => {
        return {
          color: props.data.id,
          bases: props.data.bases
        }
      },
      headerName: "Code",
      width: 200,
      sortable: true,
      filter: true,
      cellRenderer: props => {
        if (props.value.bases) {
        return (<div style={{display: "flex", height: "100%"}}>
          <div style={{backgroundColor: props.value.bases[0]}} className="MiniColorCell"></div>
          <div style={{backgroundColor: props.value.color}} className="ColorCell">{props.value.color}</div>
          <div style={{backgroundColor: props.value.bases[1]}} className="MiniColorCell"></div>
        </div>)
        } else {
          return (<div style={{backgroundColor: props.value.color}} className="ColorCell">{props.value.color}</div>)
        }
      }
    }, {
      field: "H",
      headerName: "Hue",
      width: 75,
      sortable: true,
      filter: "agNumberColumnFilter",
    }, {
      field: "S",
      headerName: "Saturation",
      width: 75,
      sortable: true,
      filter: "agNumberColumnFilter",
    }, {
      field: "V",
      headerName: "Value",
      width: 75,
      sortable: true,
      filter: "agNumberColumnFilter",
    }, {
      field: "owned",
      headerName: "Owned",
      width: 75,
      sortable: true,
      filter: true,
      cellRenderer: props => {
        return (<input type="checkbox"
        defaultChecked={props.value}
        onChange={(e) => {
          props.node.setDataValue(props.column, e.target.checked);
        }}/>)
      }
    }, {
      field: "delta",
      headerName: "Delta",
      width: 100,
      sortable: true,
      filter: "agNumberColumnFilter",
      sort: "asc",
      sortingOrder: [ "asc" ]
    }, {
      field: "minDelta",
      headerName: "Min Delta",
      width: 100,
      sortable: true,
      filter: "agNumberColumnFilter",
    }], []);

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
        if (node.data.collection !== "Mix" && node.data.owned) {
          ownedColors.push(node.data.name);
        }
      });    
      localStorage.setItem("ownedColors", JSON.stringify(ownedColors));
    }

    const tableRef = React.useRef(null);
    React.useEffect(() => {
      updateTopColors();
    }, [props.selectedColor])

    return (<AgGridReact className="ag-theme-alpine"
        ref={tableRef}
        rowData={colorsWithDelta}
        columnDefs={columns}
        rowHeight={75}
        pagination={true}
        onFilterChanged={updateTopColors}
        onSortChanged={updateTopColors}
        onCellValueChanged={updateLocalStorage}
    />)
  };

  export default ColorTable;