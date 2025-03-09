// Step2.tsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setFormData } from "../../app/store/slices/formSlice";
import type { RootState } from "../../app/store/store";
import FormQuestion from "../shared/FormQuestion";
import StateSelectionQuestion from "../shared/StateSelector";
import { StepProps, Question, MapboxFeature } from "../types";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

const Step2: React.FC<StepProps> = ({
  currentSubstep,
  onInputChange,
  formData,
}) => {
  const dispatch = useDispatch();
  // Get the persisted form state from Redux
  const persistedFormData = useSelector(
    (state: RootState) => state.form.formData,
  );
  const persistedSubstep = useSelector(
    (state: RootState) => state.form.currentSubstep,
  );

  // Initialize state using persisted data
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(
    persistedFormData["property-features"] === "yes",
  );

  // Add state for coordinates
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    setShowAdditionalFeatures(formData["property-features"] === "yes");
  }, [formData]);

  useEffect(() => {
    if (coordinates && mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [coordinates[0], coordinates[1]],
        zoom: 15,
        accessToken: MAPBOX_ACCESS_TOKEN
      });

      // Add marker
      new mapboxgl.Marker()
        .setLngLat([coordinates[0], coordinates[1]])
        .addTo(mapRef.current);
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [coordinates]);

  const handleStateSelect = useCallback(
    (state: string) => {
      onInputChange("property-location", state);
      // Also update Redux store
      dispatch(
        setFormData({ ...persistedFormData, "property-location": state }),
      );
    },
    [onInputChange, dispatch, persistedFormData],
  );

  const handleAddressSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    // Update the input value immediately
    onInputChange("property-address", query);
    dispatch(
      setFormData({
        ...persistedFormData,
        "property-address": query,
      })
    );

    const countries = [
      'us', 'ca', 'mx', 'br', 'ar', 'co', 'pe', 've', 
      'cl', 'ec', 'bo', 'py', 'uy', 'gy', 'sr', 'gf'
    ].join(',');

    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    const response = await fetch(
      `${endpoint}?access_token=${MAPBOX_ACCESS_TOKEN}&country=${countries}&types=address&limit=5`
    );
    const data = await response.json();
    setSearchResults(data.features || []);
  };

  const handleAddressSelect = (feature: MapboxFeature) => {
    onInputChange("property-address", feature.place_name);
    setCoordinates(feature.geometry.coordinates);
    setSearchResults([]);
    dispatch(
      setFormData({
        ...persistedFormData,
        "property-address": feature.place_name,
      })
    );
  };

  const handleInputChange = useCallback(
    (
      questionId: string,
      value: string,
      textFieldValues?: { [key: number]: string },
      feature?: { place_name: string, properties: any, geometry?: { coordinates: [number, number] } }
    ) => {
      console.log('handleInputChange called with:', { questionId, value, textFieldValues, feature });
      
      if (questionId === "address-option") {
        onInputChange("address-option", value);
        if (feature) {
          console.log('Feature selected:', feature);
          onInputChange("property-address", feature.place_name);
          if (feature.geometry?.coordinates) {
            setCoordinates(feature.geometry.coordinates);
          }
          dispatch(
            setFormData({
              ...persistedFormData,
              "address-option": value,
              "property-address": feature.place_name,
            }),
          );
        }
      } else {
        onInputChange(questionId, value);
        dispatch(
          setFormData({
            ...persistedFormData,
            [questionId]: value,
          }),
        );
      }
    },
    [onInputChange, dispatch, persistedFormData],
  );

  const addressOptionQuestion: Question = {
    id: "address-option",
    description: "What is the property address?",
    tooltip: "The address must be complete and accurate for the offer to be valid.",
    options: [
      {
        value: "now",
        label: "Property Address",
        textFields: [
          {
            label: "Property Address",
            placeholder: "Start typing the address...",
            helperText: "Enter the address of the property you are purchasing",
            type: "mapbox-autocomplete",
            accessToken: MAPBOX_ACCESS_TOKEN,
            additionalComponent: coordinates && (
              <div 
                ref={mapContainerRef} 
                className="mt-4 h-[300px] w-full rounded-lg overflow-hidden"
              />
            ),
          },
        ],
      },
    ],
  };

  const legalLandDescriptionQuestion: Question = {
    id: "legal-land-description",
    description: "When would you like to add the house's legal land description?",
    tooltip: "The legal land description is the official property description from county records. It typically includes lot number, block number, subdivision name, and other identifying details.",
    options: [
      {
        value: "attach",
        label: "Attach Separately",
      },
      {
        value: "specify",
        label: "Specify Here",
        textFields: [
          {
            label: "What is the legal land description?",
            placeholder: "e.g. Lot number, block number, additions, city, county, state",
          },
        ],
      },
    ],
  };

  const PropertyFeaturesQuestion: Question = {
    id: "property-features",
    description: "Are there any chattels, fixtures, or improvements included in the purchase?",
    tooltip: "Chattels are movable items (like appliances), fixtures are attached items (like built-in cabinets), and improvements are permanent additions to the property. Specify what's included in the sale.",
    options: [
      {
        value: "yes",
        label: "Yes",
      },
      {
        value: "no",
        label: "No",
      },
    ],
  };

  const AdditionalFeaturesQuestion: Question = {
    id: "additional-features",
    description: "When would you like to describe the chattels, fixtures or improvements?",
    tooltip: "List all items that will be included in the sale. Be specific to avoid any misunderstandings about what stays with the property.",
    options: [
      {
        value: "attach",
        label: "Attach separately",
      },
      {
        value: "specify",
        label: "Specify here",
        textFields: [
          {
            label: "What chattels, fixtures, and improvements are included?",
            placeholder: "e.g. Refrigerator, Washer, Dryer, Built-in Shelves",
            helperText: "Separate items with commas",
          },
        ],
      },
    ],
  };

  const handlePropertyFeaturesChange = useCallback(
    (questionId: string, value: string) => {
      onInputChange(questionId, value);
      setShowAdditionalFeatures(value === "yes");
    },
    [onInputChange],
  );

  return (
    <div className="mx-auto grid grid-cols-2 gap-x-8 gap-y-10">
      {currentSubstep === 1 && (
        <div className="col-span-2 sm:col-span-2">
          <StateSelectionQuestion
            onStateSelect={handleStateSelect}
            formData={{
              state: formData["property-location"],
            }}
          />
        </div>
      )}

      {currentSubstep === 2 && (
        <div className="col-span-2 sm:col-span-2">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Property Address
          </h3>
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Start typing the address..."
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={formData["property-address"] || ''}
              onChange={(e) => handleAddressSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {searchResults.map((result) => (
                  <li
                    key={result.id}
                    className="relative cursor-pointer select-none py-2 px-3 hover:bg-gray-100"
                    onClick={() => handleAddressSelect(result)}
                  >
                    {result.place_name}
                  </li>
                ))}
              </ul>
            )}
            {coordinates && (
              <div 
                ref={mapContainerRef} 
                className="mt-4 h-[300px] w-full rounded-lg overflow-hidden"
              />
            )}
          </div>
        </div>
      )}

      {currentSubstep === 3 && (
        <div className="col-span-2 sm:col-span-2">
          <FormQuestion
            question={legalLandDescriptionQuestion}
            onChange={handleInputChange}
            title="Legal Land Description"
            initialValue={
              formData["legal-land-description-text"]
                ? "specify"
                : formData["legal-land-description"]
            }
            initialTextFieldValues={{
              0: formData["legal-land-description-text"],
            }}
          />
        </div>
      )}

      {currentSubstep === 4 && (
        <div className="col-span-2 space-y-6 sm:col-span-2">
          <FormQuestion
            question={PropertyFeaturesQuestion}
            onChange={handlePropertyFeaturesChange}
            title="Property Features"
            initialValue={formData["property-features"]}
          />
          {showAdditionalFeatures && (
            <FormQuestion
              question={AdditionalFeaturesQuestion}
              onChange={handleInputChange}
              initialValue={
                formData["additional-features-text"]
                  ? "specify"
                  : formData["additional-features"]
              }
              initialTextFieldValues={{
                0: formData["additional-features-text"],
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Step2;
