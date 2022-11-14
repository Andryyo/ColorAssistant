/* eslint-disable react/prop-types */
import * as culori from 'culori';
import React from 'react';

interface ISelectedColorProps {
  selectedColor: culori.ILabColor;
  onChange: (color: culori.ILabColor) => void;
}

const SelectedColor = (props : ISelectedColorProps) => {
  const [text, setText] = React.useState<string>(culori.formatHex(props.selectedColor));

  const selectColor = (color: string) => {
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
  }, [props.selectedColor]);

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
