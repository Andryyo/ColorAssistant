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

const MapColorSelector = (props) => {
  const mapRef = React.useRef(null);

  const icon = new Icon({
    iconUrl: '/ColorAssistant/images/marker-icon-2x.png',
    shadowUrl: '/ColorAssistant/images/marker-shadow.png',

    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
  });

  var CRSPixel = Util.extend(CRS.Simple, {
    transformation: new Transformation(1, 0, 1, 0)
  });

  const bounds = new LatLngBounds([
    [0, 0],
    [props.imgHeight || 0, props.imgWidth || 0]
  ]);

  React.useEffect(() => {
    if (mapRef.current && bounds) {
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
      >
        <EventHandler />
        {props.src && <ImageOverlay url={props.src} bounds={bounds} />}
      </MapContainer>
    </React.Fragment>
  );
};

export default MapColorSelector;
