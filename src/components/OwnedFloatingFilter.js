/* eslint-disable react/prop-types */
import { Checkbox, FormControlLabel } from '@mui/material';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';

export default forwardRef((props, ref) => {
  const [ownedOnly, setOwnedOnly] = useState(false);

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {});

  useEffect(() => {
    if (ownedOnly) {
      props.parentFilterInstance((instance) => {
        instance.onFloatingFilterChanged('equals', true);
      });
    } else {
      props.parentFilterInstance((instance) => {
        instance.onFloatingFilterChanged(null, null);
      });
    }
  }, [ownedOnly, props]);

  return (
    <React.Fragment>
      <FormControlLabel
        control={
          <Checkbox
            checked={ownedOnly}
            onChange={(e) => {
              setOwnedOnly(e.target.checked);
            }}
          />
        }
        label="Owned Only"
      />
    </React.Fragment>
  );
});
