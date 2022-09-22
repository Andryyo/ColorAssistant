/* eslint-disable react/prop-types */
import React from "react";
import * as chromatism from "chromatism"
import { data as vallejoGame } from "VallejoGame"
import { AgGridReact } from "ag-grid-react";

import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

const ColorTable = props => {
    const colors = React.useMemo(() => vallejoGame.split('\n').map(s => {
        const code = s.substring(s.indexOf("#"));
        const color = chromatism.convert(code).hsv;
        const H = color.h;
        const S = color.s || 0;
        const V = color.v;
        return {
          collection: "Vallejo Game Color",
          name: s.substring(0, s.indexOf("#") - 1),
          id: code,
          color: color,
          H: Math.round(H),
          S: Math.round(S),
          V: Math.round(V),
          owned: false,
        };
    }), []);

    const colorsWithDelta = React.useMemo(() => {
      return colors.map(c => {
        const delta = props.selectedColor ? Math.round(chromatism.difference(c.color, props.selectedColor, 2, 1)) : null;
        return {...c, delta};
      })}, [props.selectedColor]);

    const columns = React.useMemo(() => [{
      field: "collection",
      headerName: "Collection",
      width: 150,
      filter: true
    }, {
      field: "name",
      headerName: "Name",
      width: 150,
      sortable: true,
      filter: true
    }, {
      field: "id",
      headerName: "Code",
      width: 150,
      sortable: true,
      filter: true,
      autoHeight: true,
      cellRenderer: props => {
        return (<div style={{backgroundColor: props.value}} className="ColorCell">{props.value}</div>)
      }
    }, {
      field: "H",
      headerName: "Hue",
      width: 75,
      sortable: true,
      filter: true,
    }, {
      field: "S",
      headerName: "Saturation",
      width: 75,
      sortable: true,
      filter: true
    }, {
      field: "V",
      headerName: "Value",
      width: 75,
      sortable: true,
      filter: true
    }, {
      field: "owned",
      headerName: "Owned",
      width: 75,
      sortable: true,
      filter: true,
      cellRenderer: props => {
        return (<input type="checkbox" defaultChecked={props.value} readOnly/>)
      }
    }, {
      field: "delta",
      headerName: "Delta",
      width: 100,
      sortable: true,
      filter: true
    }], []);

    return (<AgGridReact className="ag-theme-alpine"
        rowData={colorsWithDelta}
        columnDefs={columns}
    />)
  };

  export default ColorTable;