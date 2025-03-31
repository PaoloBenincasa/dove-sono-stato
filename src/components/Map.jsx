import { useContext, useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import supabase from "../supabase/client";
import CollectionsContext from "../context/CollectionsContext"; 


export default function Map({ savedPlaces }) {
  const { collections, selectedCollections, handleCollectionChange, handleDeleteCollection } = useContext(CollectionsContext);
  const mapRef = useRef(null);
  const places = savedPlaces.filter(place => selectedCollections.includes(place.collection_id));


  const getMarkerColor = (collectionId) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.color : "blue"; 
  };

  const createCustomDivIcon = (color) => {
    return L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${color}; width: 13px; height: 13px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  useEffect(() => {
    const handleScrollToMarker = (event) => {
      const placeId = event.detail;
      const place = savedPlaces.find((p) => p.id === placeId);

      if (place && mapRef.current) {
        mapRef.current.flyTo([place.latitude, place.longitude], 15);
      }
    };

    window.addEventListener("scrollToMarker", handleScrollToMarker);
    return () => {
      window.removeEventListener("scrollToMarker", handleScrollToMarker);
    };
  }, [savedPlaces]);



  return (
    <div className="container">
      <h4 className="mb-2 pt-3 txtWhite underBlue">Seleziona le raccolte da visualizzare</h4>
      {collections.map((collection) => (
        <div key={collection.id} className="ms-3 ">
          <label>
            <input
              type="checkbox"
              checked={selectedCollections.includes(collection.id)}
              onChange={() => handleCollectionChange(collection.id)}
            />
            <span className="txtWhite ms-1 mapCollectionName">{collection.name}</span>
          </label>
          <small
            className="btn-delete ms-2"
            onClick={() => handleDeleteCollection(collection.id)}
          >
            elimina
          </small>
        </div>
      ))}



      <div className="container mt-3">
        <MapContainer ref={mapRef} center={[42, 12]} zoom={5} style={{ height: "500px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {places
            .filter(place => selectedCollections.includes(place.collection_id)) 
            .map((place) => (
              <Marker
                key={place.id}
                position={[place.latitude, place.longitude]}
                icon={createCustomDivIcon(getMarkerColor(place.collection_id))}
              >
                <Popup>{place.name}</Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}