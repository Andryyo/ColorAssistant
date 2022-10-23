/* eslint-disable react/prop-types */
import React from 'react';
import { db } from 'db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Icon, IconButton } from '@mui/material';
import deleteIcon from './delete-icon.svg';

const Gallery = (props) => {
  const images = useLiveQuery(() => db.gallery.toArray());

  return (
    <div style={props.style} className="Gallery">
      {images?.map((i) => (
        <div
          className="GalleryItem"
          key={i.id}
          style={{ position: 'relative' }}
        >
          <img
            src={URL.createObjectURL(i.preview)}
            onClick={() => {
              if (props.selectPicture) {
                props.selectPicture(i);
              }
            }}
          />
          <IconButton
            onClick={() => db.gallery.delete(i.id)}
            style={{ position: 'absolute', top: '-0.25em', right: '-0.15em' }}
          >
            <Icon style={{ width: '0.75em', height: 'auto' }}>
              <img src={deleteIcon} />
            </Icon>
          </IconButton>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
