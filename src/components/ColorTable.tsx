import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import CollectionsFilter from './CollectionsFilter';
import OwnedFloatingFilter from './OwnedFloatingFilter';
import * as culori from 'culori';
import { IColor, IDeltaOptions, isMix } from './Options';
import { ILabColor } from 'culori';
import { CellValueChangedEvent, GetRowIdParams, ICellRendererParams, RowNode, ValueGetterParams } from 'ag-grid-community';

const difference = culori.differenceCiede2000();

interface IColorTableProps {
  colors: IColor[];
  selectedColor: ILabColor;
  deltaOptions: IDeltaOptions;
  loading: boolean;
  updateOwned: (colors: IColor[]) => void;
  onTopColorsChange: (colors: IColor[]) => void;
}

const ColorTable = (props : IColorTableProps) => {
  const tableRef = React.useRef<AgGridReact>(null);

  const colorsWithDelta = React.useMemo(() => {
    const result = props.colors?.map((c) => {
      const delta = props.selectedColor
        ? difference(c.color, props.selectedColor)
        : null;
      let adjustedDelta = delta;
      if (props.deltaOptions) {
        let basesDiff = 0;
        if (isMix(c)) {
          basesDiff = difference(c.bases[0].color, c.bases[1].color);
        }
        adjustedDelta = delta + props.deltaOptions.farMixPenalty * basesDiff;
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
        headerName: 'Code',
        width: 200,
        filter: true,
        cellRenderer: (p: ICellRendererParams<IColor, IColor>) => {
          const data = p.data;
          if (isMix(data)) {
            return (
              <div style={{ display: 'flex', height: '100%' }}>
                <div
                  style={{ backgroundColor: data.bases[0].hex }}
                  className="MiniColorCell"
                ></div>
                <div
                  style={{ backgroundColor: data.hex }}
                  className="ColorCell">
                  <div
                    style={{ backgroundColor: culori.formatHex(props.selectedColor) }}
                    className="CenterColorCell">
                      {p.data.hex}
                  </div>
                </div>
                <div
                  style={{ backgroundColor: data.bases[1].hex }}
                  className="MiniColorCell"
                ></div>
              </div>
            );
          } else {
            return (
              <div
                style={{ backgroundColor: p.data.hex }}
                className="ColorCell">
                <div
                  style={{ backgroundColor: culori.formatHex(props.selectedColor) }}
                  className="CenterColorCell">
                    {p.data.hex}
                </div>
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
        cellRenderer: (p : ICellRendererParams<IColor, boolean>) => {
          return (
            <input
              type="checkbox"
              defaultChecked={p.value}
              disabled={p.data?.collection === 'Mix'}
              onChange={(e) => {
                p.node.setDataValue(p.column, e.target.checked);
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
        sortingOrder:  ['asc' as const]
      },
      {
        field: 'adjustedDelta',
        headerName: 'Adjusted Delta',
        width: 75,
        sortable: true,
        sort: 'asc' as const,
        sortingOrder: ['asc' as const]
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
        valueGetter: (p: ValueGetterParams<IColor>) => p.data?.color.l
      },
      {
        headerName: 'Saturation',
        width: 75,
        sortable: true,
        valueGetter: (p: ValueGetterParams<IColor>) =>
          p.data?.color && Math.hypot(p.data.color.a, p.data.color.b)
      }
    ],
    [collections, props.colors]
  );

  const onCellValueChanged = (e: CellValueChangedEvent<IColor, IColor>) => {
    if (props.updateOwned) {
      props.updateOwned([e.data]);
    }
  };

  const updateTopColors = React.useCallback(() => {
    if (props.onTopColorsChange) {
      const topColors : IColor[] = [];
      tableRef.current.api?.forEachNodeAfterFilterAndSort((node: RowNode<IColor>) => {
        topColors.push(node.data);
      });
      props.onTopColorsChange(topColors);
    }
  }, [props]);

  React.useEffect(() => {
    updateTopColors();
  }, [colorsWithDelta, updateTopColors]);

  return (
    <AgGridReact
      className="ag-theme-material"
      ref={tableRef}
      columnDefs={columns}
      rowHeight={75}
      onCellValueChanged={(e: CellValueChangedEvent<IColor, IColor>) => onCellValueChanged(e)}
      enableCellTextSelection={true}
      rowData={colorsWithDelta}
      getRowId={(r: GetRowIdParams<IColor>) => r.data.collection + ' ' + r.data.name + ' ' + r.data.hex}
      onFilterChanged={updateTopColors}
      onSortChanged={updateTopColors}
    />
  );
};

export default ColorTable;
