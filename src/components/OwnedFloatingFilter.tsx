import { Checkbox, FormControlLabel } from '@mui/material';
import { IFloatingFilterParams } from 'ag-grid-community';
import React, { forwardRef, useEffect, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OwnedFloatingFilter = forwardRef((props: IFloatingFilterParams, ref) => {
  const [ownedOnly, setOwnedOnly] = useState(false);

  // expose AG Grid Filter Lifecycle callbacks
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
OwnedFloatingFilter.displayName = 'OwnedFloatingFilter';

export default OwnedFloatingFilter;
