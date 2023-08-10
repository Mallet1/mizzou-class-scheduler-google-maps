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
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRendererProps, Select } from "@blueprintjs/select";
import "@reach/combobox/styles.css";
import { SyntheticEvent, useEffect, useReducer, useState } from "react";
import { AllDirectionType, OneDirectionType, PathOptionsType } from "./types";
import { defaultPathOptions } from "./utils";

type PlacesProps = {
  startPos: google.maps.LatLngLiteral | undefined;
  setStartPos: (position: google.maps.LatLngLiteral) => void;
  endPos: google.maps.LatLngLiteral | undefined;
  setEndPos: (position: google.maps.LatLngLiteral) => void;
  allDirections: AllDirectionType;
  setAllDirections: any;
  selectedWeekday: string;
  setSelectedWeekday: any;
  selectedDirectionIndex: number | null;
  setSelectedDirectionIndex: any;
  rerenderMap: any;
};

export default function Places({
  startPos,
  setStartPos,
  endPos,
  setEndPos,
  allDirections,
  setAllDirections,
  selectedWeekday,
  setSelectedWeekday,
  selectedDirectionIndex,
  setSelectedDirectionIndex,
  rerenderMap,
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
  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

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

    if (start) {
      setStartPos({ lat, lng });
    } else if (startPos) {
      setEndPos({ lat, lng });
    }
  };

  return (
    <>
      <div className="directions-form">
        <select
          onChange={(e) => {
            setSelectedDirectionIndex(null);
            setSelectedWeekday(e.target.value);
          }}
          value={selectedWeekday}
        >
          {weekdays.map((day) => (
            <option value={day} key={day}>
              {day}
            </option>
          ))}
        </select>

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
                  if (
                    status === "OK" &&
                    result &&
                    selectedDirectionIndex !== null
                  ) {
                    setAllDirections(() => {
                      const newDirections = allDirections;
                      newDirections[selectedWeekday][
                        selectedDirectionIndex
                      ].directions = result;

                      rerenderMap();

                      return newDirections;
                    });
                  }
                }
              );
            }
          }}
        >
          Save
        </button>
      </div>

      <hr />

      <div className="directions-selector">
        {allDirections[selectedWeekday].map((item: any, i: number) => (
          <div className="directions-selector-row" key={i}>
            <button
              className="directions-selector-btn"
              onClick={() => {
                setAllDirections(() => {
                  let newDirections = allDirections;

                  newDirections[selectedWeekday] = newDirections[
                    selectedWeekday
                  ].map((val: OneDirectionType, index: number) => {
                    let newPathOptions = val.pathOptions;

                    // if (index !== i)
                    //   newPathOptions = {
                    //     ...newPathOptions,
                    //     strokeColor: "#1976D2",
                    //   };
                    // else
                    //   newPathOptions = {
                    //     ...newPathOptions,
                    //     strokeColor: "#90EE90",
                    //   };

                    return { ...val, pathOptions: newPathOptions };
                  });

                  return newDirections;
                });
                rerenderMap();

                setSelectedDirectionIndex(i);
              }}
              disabled={i === selectedDirectionIndex}
            >
              Directions {i + 1}
            </button>
            <button
              onClick={() =>
                setAllDirections(() => {
                  let newDirections: AllDirectionType = allDirections;
                  newDirections[selectedWeekday] = newDirections[
                    selectedWeekday
                  ].map((curr: OneDirectionType, index: number) => {
                    if (index === i)
                      return {
                        directions: null,
                        show: true,
                        pathOptions: defaultPathOptions,
                      };
                    return curr;
                  });

                  rerenderMap();

                  return newDirections;
                })
              }
            >
              Clear
            </button>
            <button
              onClick={() =>
                setAllDirections(() => {
                  let newDirections: AllDirectionType = allDirections;
                  newDirections[selectedWeekday] = newDirections[
                    selectedWeekday
                  ].map((curr: OneDirectionType, index: number) => {
                    if (index === i)
                      return {
                        directions: curr.directions,
                        show: !curr.show,
                        pathOptions: curr.pathOptions,
                      };
                    return curr;
                  });

                  rerenderMap();

                  return newDirections;
                })
              }
            >
              Toggle
            </button>
            <button
              onClick={() =>
                setAllDirections(() => {
                  let newDirections = allDirections;
                  newDirections[selectedWeekday] = newDirections[
                    selectedWeekday
                  ].filter((_: any, index: number) => index !== i);

                  rerenderMap();

                  return newDirections;
                })
              }
            >
              Delete
            </button>
          </div>
        ))}
        <Button
          className="directions-selector-plus-btn"
          icon={"plus"}
          onClick={() => {
            setAllDirections(() => {
              allDirections[selectedWeekday].push({
                directions: null,
                show: true,
                pathOptions: defaultPathOptions,
              });
              return allDirections;
            });

            rerenderMap();
          }}
        />
      </div>
    </>
  );
}
