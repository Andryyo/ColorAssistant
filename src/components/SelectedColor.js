/* eslint-disable react/prop-types */
import React from 'react';
import * as culori from 'culori';

const SelectedColor = (props) => {
  const [text, setText] = React.useState(culori.formatHex(props.selectedColor));

  const selectColor = (color) => {
    try {
      setText(color);
      if (props.onChange) {
        props.onChange(culori.lab65(color));
      }
      // eslint-disable-next-line no-empty
    } catch {}
  };

  React.useEffect(() => {
    setText(culori.formatHex(props.selectedColor));
  }, [props.selecteColor]);

  return (
    <input
      type="text"
      className="SelectedColor"
      style={{
        backgroundColor: culori.formatHex(props.selectedColor),
        height: 'auto'
      }}
      value={text}
      onChange={(e) => selectColor(e.target.value)}
    />
  );
};

export default SelectedColor;
