import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import { useState } from "react";

type PlacesProps = {
  startPos: google.maps.LatLngLiteral | undefined;
  setStartPos: (position: google.maps.LatLngLiteral) => void;
  endPos: google.maps.LatLngLiteral | undefined;
  setEndPos: (position: google.maps.LatLngLiteral) => void;
  directions: google.maps.DirectionsResult[];
  setDirections: any;
};

export default function Places({
  startPos,
  setStartPos,
  endPos,
  setEndPos,
  directions,
  setDirections,
}: PlacesProps) {
  const {
    value: start,
    setValue: setStart,
    suggestions: { status: startStatus, data: startData },
    clearSuggestions: startClearSuggestions,
  } = usePlacesAutocomplete();
  const {
    value: end,
    setValue: setEnd,
    suggestions: { status: endStatus, data: endData },
    clearSuggestions: endClearSuggestions,
  } = usePlacesAutocomplete();

  const [currentDirections, setCurrentDirections] =
    useState<google.maps.DirectionsResult>();

  const handleSelect = async (start: boolean, val: string) => {
    if (start) {
      setStart(val, false); // shouldFetchData is false because we aren't asking it to load more data, we have chosen a selection
      startClearSuggestions();
    } else {
      setEnd(val, false);
      endClearSuggestions();
    }

    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]);
    console.log(lat, lng);

    if (start) {
      setStartPos({ lat, lng });
    } else if (startPos) {
      setEndPos({ lat, lng });
    }
  };

  return (
    <>
      <Combobox onSelect={(val) => handleSelect(true, val)}>
        <label htmlFor="to">Start: </label>
        <ComboboxInput
          id="to"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="combobox-input"
          placeholder="Search an address"
        />
        <ComboboxPopover>
          <ComboboxList>
            {startStatus === "OK" &&
              startData.map(({ place_id, description }) => (
                <ComboboxOption key={place_id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>

      <Combobox onSelect={(val) => handleSelect(false, val)}>
        <label htmlFor="from">End: </label>
        <ComboboxInput
          id="to"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="combobox-input"
          placeholder="Search an address"
        />
        <ComboboxPopover>
          <ComboboxList>
            {endStatus === "OK" &&
              endData.map(({ place_id, description }) => (
                <ComboboxOption key={place_id} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
      <button
        onClick={() => {
          if (startPos && endPos) {
            const service = new google.maps.DirectionsService();
            service.route(
              {
                origin: startPos,
                destination: endPos,
                travelMode: google.maps.TravelMode.WALKING,
              },
              (result, status) => {
                if (status === "OK" && result) {
                  setDirections([...directions, result]);
                }
              }
            );
          }
        }}
      >
        Save
      </button>
    </>
  );
}
