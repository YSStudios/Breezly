import React, { useState, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
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

interface AddressFieldProps {
  name: string;
  label?: string;
  disabled?: boolean;
  showMap?: boolean;
}

export function AddressField({
  name,
  label,
  disabled = false,
  showMap = true,
}: AddressFieldProps) {
  const { control, setValue } = useFormContext();
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Set up map when coordinates change
  useEffect(() => {
    if (coordinates && mapContainerRef.current && showMap) {
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
  }, [coordinates, showMap]);
  
  // Handle address search
  const handleAddressSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

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
    setValue(name, feature.place_name);
    setCoordinates(feature.geometry.coordinates);
    setSearchResults([]);
  };
  
  return (
    <div>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              type="text"
              id={name}
              placeholder="Start typing the address..."
              className="block w-full rounded-md border-0 px-3 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              {...field}
              onChange={(e) => {
                field.onChange(e.target.value);
                handleAddressSearch(e.target.value);
              }}
              disabled={disabled}
            />
          )}
        />
        
        {searchResults.length > 0 && !disabled && (
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
        
        {coordinates && showMap && (
          <div 
            ref={mapContainerRef} 
            className="mt-4 h-[300px] w-full rounded-lg overflow-hidden"
          />
        )}
      </div>
    </div>
  );
} 