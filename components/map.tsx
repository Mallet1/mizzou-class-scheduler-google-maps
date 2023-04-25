import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

export default function Map() {
  const [startPos, setStartPos] = useState<LatLngLiteral>();
  const [endPos, setEndPos] = useState<LatLngLiteral>();
  const [directions, setDirections] = useState<DirectionsResult[]>([]);
  const mapRef = useRef<GoogleMap>();
  const center = useMemo<LatLngLiteral>(
    () => ({ lat: 38.9517, lng: -92.3341 }),
    []
  );
  const loc1: LatLngLiteral = {
    lat: 38.9517,
    lng: -92.3341,
  };

  const loc2: LatLngLiteral = {
    lat: 38.627,
    lng: -90.1994,
  };
  const options = useMemo<MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
    }),
    []
  );
  const onLoad = useCallback((map) => {
    // let newDirections = directions;

    // const service = new google.maps.DirectionsService();
    // service.route(
    //   {
    //     origin: loc1,
    //     destination: loc2,
    //     travelMode: google.maps.TravelMode.WALKING,
    //   },
    //   (result, status) => {
    //     if (status === "OK" && result) {
    //       console.log(result);
    //       newDirections.push(result);
    //     }
    //   }
    // );
    // service.route(
    //   {
    //     origin: {
    //       lat: 38.9517,
    //       lng: -91.3341,
    //     },
    //     destination: {
    //       lat: 39.9517,
    //       lng: -91.3341,
    //     },
    //     travelMode: google.maps.TravelMode.WALKING,
    //   },
    //   (result, status) => {
    //     if (status === "OK" && result) {
    //       console.log(result);
    //       newDirections.push(result);
    //     }
    //   }
    // );

    // setDirections(newDirections);

    mapRef.current = map;
  }, []);
  const houses = useMemo(() => generateHouses(center), [center]);

  const fetchDirections = (house: LatLngLiteral) => {
    if (!startPos) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: house,
        destination: startPos,
        travelMode: google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections([...directions, result]);
        }
      }
    );
  };

  return (
    <div className="container">
      <div className="controls">
        <h1>Commute?</h1>
        <Places
          startPos={startPos}
          setStartPos={(position) => {
            setStartPos(position);
            mapRef.current?.panTo(position);
          }}
          endPos={endPos!}
          setEndPos={(position) => {
            setEndPos(position);
            mapRef.current?.panTo(position);
          }}
          directions={directions}
          setDirections={setDirections}
        />
        {directions.map((direction, i) =>
          direction ? (
            <Distance key={i} leg={direction.routes[0].legs[0]} />
          ) : null
        )}
      </div>
      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          mapContainerClassName="map-container"
          options={options}
          onLoad={onLoad}
        >
          {directions.map((direction, i) => (
            <DirectionsRenderer
              key={i}
              directions={direction}
              options={{
                polylineOptions: {
                  zIndex: 50,
                  strokeColor: "#1976D2",
                  strokeWeight: 5,
                },
              }}
            />
          ))}

          {/* <DirectionsRenderer
            directions={directions[0]}
            options={{
              polylineOptions: {
                zIndex: 50,
                strokeColor: "#1976D2",
                strokeWeight: 5,
              },
            }}
          />
          <DirectionsRenderer
            directions={directions[1]}
            options={{
              polylineOptions: {
                zIndex: 50,
                strokeColor: "#1976D2",
                strokeWeight: 5,
              },
            }}
          /> */}

          {startPos && <Marker position={startPos} />}
          {endPos && <Marker position={endPos} />}

          {/* <Marker
            position={loc1}
            onClick={() => {
              console.log(loc1);
            }}
          />
          <Marker
            position={loc2}
            onClick={() => {
              console.log(loc2);
            }}
          /> */}
        </GoogleMap>
      </div>

      <button onClick={() => console.log(directions)}>Click</button>
    </div>
  );
}

const defaultOptions = {
  strokeOpacity: 0.5,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
};
const closeOptions = {
  ...defaultOptions,
  zIndex: 3,
  fillOpacity: 0.05,
  strokeColor: "#8BC34A",
  fillColor: "#8BC34A",
};
const middleOptions = {
  ...defaultOptions,
  zIndex: 2,
  fillOpacity: 0.05,
  strokeColor: "#FBC02D",
  fillColor: "#FBC02D",
};
const farOptions = {
  ...defaultOptions,
  zIndex: 1,
  fillOpacity: 0.05,
  strokeColor: "#FF5252",
  fillColor: "#FF5252",
};

const generateHouses = (position: LatLngLiteral) => {
  const _houses: Array<LatLngLiteral> = [];
  for (let i = 0; i < 100; i++) {
    const direction = Math.random() < 0.5 ? -2 : 2;
    _houses.push({
      lat: position.lat + Math.random() / direction,
      lng: position.lng + Math.random() / direction,
    });
    console.log(position.lat + Math.random() / direction);
  }
  return _houses;
};
