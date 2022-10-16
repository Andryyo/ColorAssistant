/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import CollectionsFilter from 'CollectionsFilter';
import OwnedFloatingFilter from 'OwnedFloatingFilter';
import * as culori from 'culori';
import { ColorsMessage } from 'ColorsMessage';

const difference = culori.differenceCiede2000();

const ColorTable = (props) => {
  const tableRef = React.useRef(null);
  const [colors, setColors] = React.useState(null);

  React.useEffect(() => {
    if (!props.worker) {
      return;
    }
    props.worker.onmessage = (message) => {
      if (message.data.type === 'colorsUpdated') {
        try {
          const rawColors = ColorsMessage.decode(message.data.data).colors;
          const colors = rawColors.map((c) => {
            if (c.bases?.length > 0) {
              const ratios = [
                { value: 0.25, name: '3 to 1' },
                { value: 0.5, name: '1 to 1' },
                { value: 0.75, name: '1 to 3' }
              ];

              const name =
                rawColors[c.bases[0]].collection +
                ' ' +
                rawColors[c.bases[0]].name +
                ' + ' +
                rawColors[c.bases[1]].collection +
                ' ' +
                rawColors[c.bases[1]].name +
                ' ' +
                ratios.find((r) => r.value === c.ratio)?.name;

              return { ...c, name: name, collection: 'Mix' };
            } else {
              return c;
            }
          });

          setColors(colors);
        } catch (err) {
          console.log(err);
        }
      } else if (message.data.type === 'progressUpdate') {
        if (message.data.value === 100) {
          tableRef.current?.api?.hideOverlay();
        } else {
          tableRef.current?.api?.showLoadingOverlay();
        }
      }
    };
  }, [props.worker]);

  React.useEffect(() => {
    if (props.selectedColor && props.worker) {
      props.worker.postMessage({
        type: 'updateSelectedColor',
        selectedColor: props.selectedColor
      });
    }
  }, [props.worker, props.selectedColor]);

  const colorsWithDelta = React.useMemo(() => {
    const result = colors?.map((c) => {
      const delta = props.selectedColor
        ? Math.round(difference(c.color, props.selectedColor))
        : null;
      return { ...c, delta: delta };
    });

    return result;
  }, [colors, props.selectedColor]);

  React.useEffect(() => {
    if (colorsWithDelta) {
      tableRef.current?.api?.hideOverlay();
    }
  }, [colorsWithDelta]);

  const collections = React.useMemo(() => {
    if (!colorsWithDelta) {
      return new Set();
    }

    const result = new Set(colorsWithDelta.map((c) => c.collection));
    result.add('Mix');
    return result;
  }, [colorsWithDelta]);

  const datasource = React.useMemo(() => {
    return {
      rowCount: colorsWithDelta?.length,
      getRows: (params) => {
        if (!colorsWithDelta) {
          params.successCallback(null, 0);

          return;
        }

        let result = colorsWithDelta.map((c) => c);

        if (params.sortModel?.length > 0) {
          result.sort(
            (a, b) =>
              a[params.sortModel[0].colId] - b[params.sortModel[0].colId]
          );

          if (params.sortModel[0].sort === 'desc') {
            result.reverse();
          }
        }

        for (const [name, filter] of Object.entries(params.filterModel)) {
          switch (filter.filterType) {
            case 'text':
              result = result.filter((c) =>
                c[name].toString().includes(filter.filter)
              );
              break;
            case 'collection':
              result = result.filter((c) => {
                if (c.collection === 'Mix') {
                  return (
                    filter.filter.has(c.collection) &&
                    c.bases.every((b) =>
                      filter.filter.has(colors[b].collection)
                    )
                  );
                } else {
                  return filter.filter.has(c.collection);
                }
              });
              break;
          }
        }

        if (props.onTopColorsChange) {
          const topColors = result.slice(0, 20).map((c) => {
            return { ...c, bases: c.bases?.map((b) => colors[b]) };
          });
          props.onTopColorsChange(topColors);
        }

        params.successCallback(
          result.slice(params.startRow, params.endRow),
          result.length
        );
      }
    };
  }, [colorsWithDelta]);

  const columns = React.useMemo(
    () => [
      {
        field: 'collection',
        headerName: 'Collection',
        width: 100,
        filter: CollectionsFilter,
        filterParams: { options: collections, colors: colors },
        wrapText: true
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
        sortable: true,
        filter: true,
        floatingFilter: true,
        suppressMenu: true,
        floatingFilterComponentParams: {
          suppressFilterButton: true
        },
        wrapText: true
      },
      {
        valueGetter: (props) => {
          return {
            collection: props.data?.collection,
            color: props.data?.hex,
            bases: props.data?.bases?.map((b) => colors[b])
          };
        },
        headerName: 'Code',
        width: 200,
        filter: true,
        floatingFilter: true,
        suppressMenu: true,
        floatingFilterComponentParams: {
          suppressFilterButton: true
        },
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
        field: 'H',
        headerName: 'Hue',
        width: 75,
        sortable: true
      },
      {
        field: 'S',
        headerName: 'Saturation',
        width: 75,
        sortable: true
      },
      {
        field: 'V',
        headerName: 'Value',
        width: 75,
        sortable: true
      },
      {
        field: 'owned',
        headerName: 'Owned',
        width: 75,
        filter: true,
        floatingFilter: true,
        suppressMenu: true,
        floatingFilterComponentParams: {
          suppressFilterButton: true
        },
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
        width: 50,
        sortable: true,
        sort: 'asc',
        sortingOrder: ['asc']
      },
      {
        field: 'minDelta',
        headerName: 'Min Delta',
        width: 50,
        sortable: true
      }
    ],
    [collections]
  );

  const onCellValueChanged = (e) => {
    props.worker.postMessage({
      type: 'updateOwned',
      color: e.data,
      selectedColor: props.selectedColor
    });
  };

  React.useEffect(() => {
    if (colorsWithDelta && tableRef.current?.api) {
      tableRef.current.api.purgeInfiniteCache();
    }
  }, [colors, props.selectedColor]);

  return (
    <AgGridReact
      className="ag-theme-material"
      ref={tableRef}
      columnDefs={columns}
      rowHeight={75}
      onCellValueChanged={(e) => onCellValueChanged(e)}
      enableCellTextSelection={true}
      rowModelType={'infinite'}
      datasource={datasource}
      onGridReady={(e) => e.api.showLoadingOverlay()}
    />
  );
};

export default ColorTable;
