import React from "react";
import * as chromatism from "chromatism"
import { DataGrid } from "@mui/x-data-grid";
import { data } from "VallejoGame"

const ColorTable = props => {
    const colors = React.useMemo(() => data.split('\n').map(s => {
        const code = s.substring(s.indexOf("#"));
        const color = chromatism.convert(code).hsv;
        const H = color.h;
        const S = color.s || 0;
        const V = color.v;
        return {
          name: s.substring(0, s.indexOf("#") - 1),
          id: code,
          color: color,
          H: Math.round(H),
          S: Math.round(S),
          V: Math.round(V)
        };
    }), []);

    const columns = React.useMemo(() => [{
      field: "name",
      headerName: "Name",
      width: 150
    }, {
      field: "id",
      headerName: "Code",
      type: "number",
      width: 100,
      renderCell: props => {
        return (<div style={{backgroundColor: props.value}} className="ColorCell">{props.value}</div>)
      }
    }, {
      field: "H",
      headerName: "Hue",
      type: "number",
      width: 100
    }, {
      field: "S",
      headerName: "Saturation",
      type: "number",
      width: 100
    }, {
      field: "V",
      headerName: "Value",
      type: "number",
      width: 100
    }, {
      field: "delta",
      headerName: "Delta",
      type: "number",
      width: 100,
      valueGetter: param => {
        return props.selectedColor ? chromatism.difference(param.row.color, props.selectedColor, 2, 1) : null;
      }
    }], [props.selectedColor]);

    return (<DataGrid
        rows={colors}
        columns={columns}
        sortModel={[ { field: "delta", sort: "asc" } ]}
    />)
  };

  export default ColorTable;