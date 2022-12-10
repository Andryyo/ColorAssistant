import { ILabColor } from 'culori';
import { CRS, Icon, LatLngBounds, LeafletMouseEvent, Map, Transformation, Util } from 'leaflet';
import React, { CSSProperties } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  ImageOverlay,
  useMapEvents
} from 'react-leaflet';
import { IColor, IColorWithDelta, IMixColor } from './Options';

const createIcon = (color: string, selected: boolean) : Icon => {
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

export interface IMarker {
  selected: boolean,
  x: number,
  y: number,
  collection?: string,
  name?: string,
  hex?: string,
  color?: ILabColor,
  bases?: IColorWithDelta[],
  delta?: number
}

interface IMapColorSelectorProps {
  imgHeight: number;
  imgWidth: number;
  src: string;
  active: boolean;
  click: (position: {x: number, y: number}) => void;
  boxzoomend?: (x1: number, y1: number, x2: number, y2: number) => void;
  style: CSSProperties;
  markers: IMarker[];
  markerSelected?: (marker: IMarker) => void;
  topColor: IColor;
}

interface IMarkerProps {
  marker: IMarker;
  closestColor?: IColor;
  referenceMarker?: IMarker
}

const MapColorSelector = (props : IMapColorSelectorProps) => {
  const mapRef = React.useRef<Map>(null);

  const CRSPixel = Util.extend(CRS.Simple, {
    transformation: new Transformation(1, 0, 1, 0)
  });

  const bounds = React.useMemo(
    () =>
      new LatLngBounds([
        [0, 0],
        [props.imgHeight || 1, props.imgWidth || 1]
      ]),
    [props.imgHeight, props.imgWidth]
  );

  React.useEffect(() => {
    if (mapRef.current && bounds) {
      mapRef.current.setMaxBounds(bounds.pad(0.75));
      mapRef.current.fitBounds(bounds);
    }
  }, [props.src, bounds]);

  React.useEffect(() => {
    if (mapRef.current && bounds && props.active) {
      mapRef.current.invalidateSize();
      mapRef.current.fitBounds(bounds);
    }
  }, [props.active, bounds]);

  const EventHandler = () => {
    useMapEvents({
      click: (e : LeafletMouseEvent) => {
        if (props.click) {
          props.click({ x: e.latlng.lng, y: e.latlng.lat });
        }
      },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore 
      boxzoomend: (e: {boxZoomBounds: LatLngBounds}) => {
        if (props.boxzoomend) {
          props.boxzoomend(
            e.boxZoomBounds.getWest(),
            e.boxZoomBounds.getSouth(),
            e.boxZoomBounds.getEast(),
            e.boxZoomBounds.getNorth()
          );
        }
      }
    });

    return null;
  };

  const ColorCell = (props: { bases: IColor[], referenceHex: string, hex: string }) => {
    if (props.bases?.length > 0) {
      return (
        <div style={{ display: 'flex', width: '200px' }}>
          <div
            style={{ backgroundColor: props.bases[0].hex }}
            className="MiniColorCell"
          ></div>
          <div
            style={{ backgroundColor: props.hex }}
            className="ColorCell"
          >
            <div
              style={{ backgroundColor: props.referenceHex }}
              className="CenterColorCell">
                {props.hex}
            </div>
          </div>
          <div
            style={{ backgroundColor: props.bases[1].hex }}
            className="MiniColorCell"
          ></div>
        </div>
      );
    } else {
      return (
        <div
          style={{
            backgroundColor: props.hex,
            width: '200px'
          }}
          className="ColorCell"
        >
          <div
            style={{ backgroundColor: props.referenceHex }}
            className="CenterColorCell">
              {props.hex}
          </div>
        </div>
      );
    }
  };

  const ColorPopup = (props: IMarkerProps) => {
    return (
      <Popup>
        <div style={{ maxWidth: '200px' }}>
          {props.marker.collection + ' ' + props.marker.name}
          <br />
          <ColorCell bases={props.marker.bases} hex={props.marker.hex} referenceHex={props.referenceMarker?.hex}/>
        </div>
      </Popup>
    );
  };

  const SelectedColorPopup = (props : IMarkerProps) => {
    return (
      <Popup>
        <div style={{ maxWidth: '200px' }}>
          {props.closestColor && (
            <React.Fragment>
              {"Closest: " + props.closestColor.collection + ' ' + props.closestColor.name}
              <br />
              <ColorCell bases={(props.closestColor as IMixColor)?.bases} hex={props.closestColor.hex} referenceHex={props.marker.hex} />
            </React.Fragment>
          )}
        </div>
      </Popup>
    );
  };

  const selectedMarker =  props.markers.find(x => x.selected)

  return (
    <React.Fragment>
      <link rel="stylesheet" href={process.env.PUBLIC_URL + "/leaflet.css"} />
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
            key={m.collection + m.name + m.hex}
            position={[m.y, m.x]}
            icon={createIcon(m.hex, m.selected)}
          >
            {m.selected ? (
              <SelectedColorPopup marker={m} closestColor={props.topColor} referenceMarker={selectedMarker} />
            ) : (
              <ColorPopup marker={m} closestColor={props.topColor} referenceMarker={selectedMarker}/>
            )}
          </Marker>
        ))}
      </MapContainer>
    </React.Fragment>
  );
};

export default MapColorSelector;
