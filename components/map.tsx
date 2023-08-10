import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useReducer,
} from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";
import Places from "./places";
import Distance from "./distance";
import { AllDirectionType } from "./types";
import { defaultPathOptions } from "./utils";

type LatLngLiteral = google.maps.LatLngLiteral;
type DirectionsResult = google.maps.DirectionsResult;
type MapOptions = google.maps.MapOptions;

export default function Map() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

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

  const [allDirections, setAllDirections] = useState<AllDirectionType>({
    Monday: [{ directions: null, show: true, pathOptions: defaultPathOptions }],
    Tuesday: [
      { directions: null, show: true, pathOptions: defaultPathOptions },
    ],
    Wednesday: [
      { directions: null, show: true, pathOptions: defaultPathOptions },
    ],
    Thursday: [
      { directions: null, show: true, pathOptions: defaultPathOptions },
    ],
    Friday: [{ directions: null, show: true, pathOptions: defaultPathOptions }],
    Saturday: [
      { directions: null, show: true, pathOptions: defaultPathOptions },
    ],
    Sunday: [{ directions: null, show: true, pathOptions: defaultPathOptions }],
  });
  const [selectedWeekday, setSelectedWeekday] = useState<string>("Monday");
  const [selectedDirectionIndex, setSelectedDirectionIndex] = useState<
    number | null
  >(null);

  return (
    <div className="container">
      <div className="controls">
        <button
          onClick={() => {
            forceUpdate();
            console.log(allDirections);
          }}
        >
          Click
        </button>
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
          allDirections={allDirections}
          setAllDirections={setAllDirections}
          selectedWeekday={selectedWeekday}
          setSelectedWeekday={setSelectedWeekday}
          selectedDirectionIndex={selectedDirectionIndex}
          setSelectedDirectionIndex={setSelectedDirectionIndex}
          rerenderMap={forceUpdate}
        />
        {selectedDirectionIndex !== null &&
          allDirections[selectedWeekday][selectedDirectionIndex] &&
          allDirections[selectedWeekday][selectedDirectionIndex].directions && (
            <Distance
              leg={
                allDirections[selectedWeekday][selectedDirectionIndex]
                  .directions!.routes[0].legs[0]
              }
            />
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
          {allDirections[selectedWeekday].map((direction, i) => {
            return (
              direction.directions !== null &&
              direction.show && (
                <DirectionsRenderer
                  key={i}
                  directions={direction.directions}
                  options={{
                    polylineOptions: {
                      zIndex: direction.pathOptions.zIndex,
                      strokeColor: direction.pathOptions.strokeColor,
                      strokeWeight: direction.pathOptions.strokeWeight,
                    },
                    draggable: true,
                  }}
                />
              )
            );
          })}

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
