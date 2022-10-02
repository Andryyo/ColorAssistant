/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import { Checkbox, FormControlLabel } from '@mui/material';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';

export default forwardRef((props, ref) => {
  const options = React.useMemo(() => {
    let result = new Set();
    props.api.forEachNode((node) => result.add(node.data.collection));
    return result;
  }, []);

  const [collections, setCollections] = useState(options);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      doesFilterPass(params) {
        return (
          collections.has(params.data.collection) &&
          (!params.data.baseCollections ||
            params.data.baseCollections.every((c) => collections.has(c)))
        );
      },

      isFilterActive() {
        return collections.size != options.size;
      }
    };
  });

  useEffect(() => {
    props.filterChangedCallback();
  }, [collections]);

  return (
    <div style={{ display: 'inline-block', width: '400px' }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={collections.size == options.size}
            onChange={(e) => {
              if (e.target.checked) {
                setCollections(options);
              } else {
                setCollections(new Set());
              }
            }}
          />
        }
        label="All"
      />
      {[...options].map((option) => (
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
