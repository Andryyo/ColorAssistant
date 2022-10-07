/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import {
  Canvas,
  CRS,
  Icon,
  LatLngBounds,
  map,
  Transformation,
  Util
} from 'leaflet';
import React from 'react';
import {
  TileLayer,
  MapContainer,
  Marker,
  Popup,
  ImageOverlay,
  useMapEvents
} from 'react-leaflet';

const createIcon = (color, selected) => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d');

  context.beginPath();
  context.moveTo(16.001, 1.072);
  context.bezierCurveTo(21.292, 1.072, 25.597, 5.377, 25.597, 10.669);
  context.bezierCurveTo(25.597, 12.352, 25.151, 14.01, 24.307, 15.468);
  context.lineTo(24.307, 15.468);
  context.lineTo(16, 29.862);
  context.lineTo(7.692, 15.467);
  context.bezierCurveTo(6.849, 14.011, 6.403, 12.352, 6.403, 10.669);
  context.bezierCurveTo(6.403, 5.377, 10.708, 1.072, 16, 1.072);
  context.lineTo(16, 1.072);
  context.fillStyle = color;
  context.fill();
  context.stroke();

  if (selected) {
    return new Icon({
      iconUrl: canvas.toDataURL(),

      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [1, -34]
    });
  } else {
    return new Icon({
      iconUrl: canvas.toDataURL(),

      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [1, -34]
    });
  }
};

const MapColorSelector = (props) => {
  const mapRef = React.useRef(null);

  var CRSPixel = Util.extend(CRS.Simple, {
    transformation: new Transformation(1, 0, 1, 0)
  });

  const bounds = new LatLngBounds([
    [0, 0],
    [props.imgHeight || 0, props.imgWidth || 0]
  ]);

  React.useEffect(() => {
    if (mapRef.current && bounds) {
      mapRef.current.setMaxBounds(bounds.pad(0.75));
      mapRef.current.fitBounds(bounds);
    }
  }, [props.src]);

  const EventHandler = () => {
    useMapEvents({
      click: (e) => {
        if (props.click) {
          props.click({ x: e.latlng.lng, y: e.latlng.lat });
        }
      }
    });

    return null;
  };

  const ColorCell = (props) => {
    if (props.marker.bases) {
      return (
        <div style={{ display: 'flex', width: '100px' }}>
          <div
            style={{ backgroundColor: props.marker.bases[0] }}
            className="MiniColorCell"
          ></div>
          <div
            style={{ backgroundColor: props.marker.id }}
            className="ColorCell"
          >
            {props.marker.id}
          </div>
          <div
            style={{ backgroundColor: props.marker.bases[1] }}
            className="MiniColorCell"
          ></div>
        </div>
      );
    } else {
      return (
        <div
          style={{
            backgroundColor: props.marker.id,
            width: '100px'
          }}
          className="ColorCell"
        >
          {props.marker.id}
        </div>
      );
    }
  };

  const ColorPopup = (props) => {
    return (
      <Popup>
        <div style={{ maxWidth: '200px' }}>
          {props.marker.collection}
          <br />
          {props.marker.name}
          <br />
          <ColorCell marker={props.marker} />
        </div>
      </Popup>
    );
  };

  const SelectedColorPopup = (props) => {
    return (
      <Popup>
        <div style={{ maxWidth: '200px' }}>
          <ColorCell marker={props.marker} />
          <br />
          {props.closestColor && (
            <React.Fragment>
              Closest:
              {props.closestColor.collection + ' ' + props.closestColor.name}
              <br />
              <ColorCell marker={props.closestColor} />
            </React.Fragment>
          )}
        </div>
      </Popup>
    );
  };

  return (
    <React.Fragment>
      <link rel="stylesheet" href="/ColorAssistant/leaflet.css" />
      <MapContainer
        style={props.style}
        ref={mapRef}
        center={bounds.getCenter()}
        zoom={0}
        zoomSnap={0.5}
        minZoom={-5}
        scrollWheelZoom={true}
        crs={CRSPixel}
        attributionControl={false}
        maxBoundsViscosity={0.9}
      >
        <EventHandler />
        {props.src && <ImageOverlay url={props.src} bounds={bounds} />}
        {props.markers?.map((m) => (
          <Marker
            zIndexOffset={m.selected ? 100 : 0}
            key={m.collection + m.name + m.id}
            position={[m.y, m.x]}
            icon={createIcon(m.id, m.selected)}
            eventHandlers={{
              click: (e) => {
                if (props.markerSelected) {
                  //props.markerSelected(m);
                }
              }
            }}
          >
            {m.selected ? (
              <SelectedColorPopup marker={m} closestColor={props.topColor} />
            ) : (
              <ColorPopup marker={m} />
            )}
          </Marker>
        ))}
      </MapContainer>
    </React.Fragment>
  );
};

export default MapColorSelector;
