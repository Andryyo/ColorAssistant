/* eslint-disable react/prop-types */
import { Checkbox, FormControlLabel } from '@mui/material';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';

export default forwardRef((props, ref) => {
  const [collections, setCollections] = useState(props.options);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      doesFilterPass(params) {
        return (
          collections.has(params.data.collection) &&
          (params.data.collection !== 'Mix' ||
            params.data.bases.every((b) => collections.has(b.collection)))
        );
      },

      isFilterActive() {
        return collections.size !== props.options.size;
      },

      getModel() {
        return { filterType: 'collection', filter: collections };
      }
    };
  });

  useEffect(() => {
    props.filterChangedCallback();
  }, [props, collections]);

  return (
    <div
      style={{
        width: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <FormControlLabel
        control={
          <Checkbox
            checked={collections.size === props.options.size}
            onChange={(e) => {
              if (e.target.checked) {
                setCollections(props.options);
              } else {
                setCollections(new Set());
              }
            }}
          />
        }
        label="All"
      />
      {[...props.options].map((option) => (
        <FormControlLabel
          key={option}
          label={option}
          control={
            <Checkbox
              checked={collections.has(option)}
              onChange={(e) => {
                const newCollections = new Set(collections);
                if (e.target.checked) {
                  newCollections.add(option);
                } else {
                  newCollections.delete(option);
                }
                setCollections(newCollections);
              }}
            />
          }
        />
      ))}
    </div>
  );
});
