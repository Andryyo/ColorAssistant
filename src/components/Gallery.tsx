/* eslint-disable react/prop-types */
import React, { CSSProperties } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Icon, IconButton } from '@mui/material';
import deleteIcon from '../assets/delete-icon.svg';

export interface IGalleryProps {
  style: CSSProperties;
  selectPicture: (IGalleryItem) => void;
}

const Gallery = (props : IGalleryProps) => {
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
            alt="Gallery item"
          />
          <IconButton
            onClick={() => void db.gallery.delete(i.id)}
            style={{ position: 'absolute', top: '-0.25em', right: '-0.15em' }}
          >
            <Icon style={{ width: '0.75em', height: 'auto' }}>
              <img src={deleteIcon} alt="Delete" />
            </Icon>
          </IconButton>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
