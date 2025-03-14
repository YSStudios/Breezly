// Step2.tsx
import React, { useState, useEffect, useRef } from "react";
import { useFormContext, Controller } from "react-hook-form";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface MapboxFeature {
  id: string;
  place_name: string;
  properties: any;
  geometry: {
    coordinates: [number, number];
  };
}

interface Step2Props {
  currentSubstep: number;
  isLocked?: boolean;
}

const Step2: React.FC<Step2Props> = ({ currentSubstep, isLocked }) => {
  const { control, watch, setValue } = useFormContext();
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [showAdditionalFeatures, setShowAdditionalFeatures] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Watch values for conditional rendering
  const propertyFeatures = watch("property-features");
  const propertyAddress = watch("property-address");
  
  // Set up map when coordinates change
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
  
  // Update additional features visibility
  useEffect(() => {
    setShowAdditionalFeatures(propertyFeatures === "yes");
  }, [propertyFeatures]);
  
  // Fetch coordinates for address if needed
  useEffect(() => {
    if (propertyAddress && !coordinates) {
      const fetchCoordinates = async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(propertyAddress)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=us&types=address&limit=1`
          );
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            setCoordinates(data.features[0].geometry.coordinates);
          }
        } catch (error) {
          console.error("Error fetching coordinates:", error);
        }
      };
      
      fetchCoordinates();
    }
  }, [propertyAddress, coordinates]);
  
  // Handle address search
  const handleAddressSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setValue("property-address", query);

    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
      const response = await fetch(
        `${endpoint}?access_token=${MAPBOX_ACCESS_TOKEN}&country=us&types=address&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error("Error searching addresses:", error);
      setSearchResults([]);
    }
  };
  
  // Handle address selection
  const handleAddressSelect = (feature: MapboxFeature) => {
    setValue("property-address", feature.place_name);
    setCoordinates(feature.geometry.coordinates);
    setSearchResults([]);
  };
  
  // Render radio options
  const renderRadioOptions = (
    name: string, 
    options: {value: string, label: string}[],
    label: string
  ) => (
    <div>
      <h3 className="mb-2 text-lg font-medium">{label}</h3>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {options.map((option) => (
              <div
                key={option.value}
                className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 ${
                  field.value === option.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200"
                }`}
                onClick={() => field.onChange(option.value)}
              >
                <div className="flex items-start">
                  <div
                    className={`relative h-5 w-5 flex-shrink-0 rounded-full ${
                      field.value === option.value
                        ? "bg-emerald-500 border-emerald-500"
                        : "bg-white border-2 border-gray-300"
                    }`}
                  >
                    {field.value === option.value && (
                      <svg
                        className="absolute inset-0 h-full w-full p-1 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <label className="ml-3 cursor-pointer text-lg font-medium text-gray-700">
                    {option.label}
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );

  return (
    <div className="mx-auto grid grid-cols-2 gap-x-8 gap-y-10">
      {currentSubstep === 1 && (
        <div className="col-span-2">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Property Address
          </h3>
          <div className="mt-4 relative">
            <Controller
              name="property-address"
              control={control}
              render={({ field }) => (
                <input
                  type="text"
                  placeholder="Start typing the address..."
                  className="block w-full rounded-md border-0 px-3 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    handleAddressSearch(e.target.value);
                  }}
                  disabled={isLocked}
                />
              )}
            />
            
            {searchResults.length > 0 && !isLocked && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {searchResults.map((result) => (
                  <li
                    key={result.id}
                    className="relative cursor-pointer select-none py-2.5 px-4 hover:bg-gray-100"
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

      {currentSubstep === 2 && (
        <div className="col-span-2 space-y-6">
          {renderRadioOptions(
            "property-features",
            [
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ],
            "Are there any chattels, fixtures, or improvements included in the purchase?"
          )}
          
          {showAdditionalFeatures && (
            <div className="mt-6">
              <h3 className="mb-2 text-lg font-medium">When would you like to describe the chattels, fixtures or improvements?</h3>
              <Controller
                name="additional-features"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div
                      className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 ${
                        field.value === "attach" ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                      }`}
                      onClick={() => field.onChange("attach")}
                    >
                      <div className="flex items-start">
                        <div
                          className={`relative h-5 w-5 flex-shrink-0 rounded-full ${
                            field.value === "attach" ? "bg-emerald-500 border-emerald-500" : "bg-white border-2 border-gray-300"
                          }`}
                        >
                          {field.value === "attach" && (
                            <svg
                              className="absolute inset-0 h-full w-full p-1 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <label className="ml-3 cursor-pointer text-lg font-medium text-gray-700">
                          Attach separately
                        </label>
                      </div>
                    </div>
                    
                    <div
                      className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 ${
                        field.value === "specify" ? "border-emerald-500 bg-emerald-50" : "border-gray-200"
                      }`}
                      onClick={() => field.onChange("specify")}
                    >
                      <div className="flex items-start">
                        <div
                          className={`relative h-5 w-5 flex-shrink-0 rounded-full ${
                            field.value === "specify" ? "bg-emerald-500 border-emerald-500" : "bg-white border-2 border-gray-300"
                          }`}
                        >
                          {field.value === "specify" && (
                            <svg
                              className="absolute inset-0 h-full w-full p-1 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <label className="ml-3 cursor-pointer text-lg font-medium text-gray-700">
                          Specify here
                        </label>
                      </div>
                      
                      {field.value === "specify" && (
                        <div className="mt-4">
                          <Controller
                            name="additional-features-text"
                            control={control}
                            render={({ field: textField }) => (
                              <textarea
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                rows={4}
                                placeholder="e.g. Refrigerator, Washer, Dryer, Built-in Shelves"
                                {...textField}
                              />
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </div>
      )}

      {currentSubstep === 3 && (
        <div className="col-span-2 space-y-6">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Legal Land Description
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Please provide the legal land description for the property. This information can typically be found on the property deed or tax records.
          </p>
          <Controller
            name="legal-land-description"
            control={control}
            render={({ field }) => (
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                rows={6}
                placeholder="e.g. Lot 7, Block 3, Anytown Subdivision, according to the plat thereof recorded in Book 5 of Plats, Page 23, records of Sample County, State"
                {...field}
                disabled={isLocked}
              />
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Step2;
