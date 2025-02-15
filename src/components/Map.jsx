import { useContext, useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import supabase from "../supabase/client";
import CollectionsContext from "../context/CollectionsContext"; // Importa il context


export default function Map() {
  const { collections, selectedCollections, handleCollectionChange, handleDeleteCollection } = useContext(CollectionsContext);
  const [places, setPlaces] = useState([]);
 

  useEffect(() => {
    if (selectedCollections.length === 0) {
      return;
    }

    const fetchPlaces = async () => {
      const { data, error } = await supabase
        .from("saved_places")
        .select("*")
        .in("collection_id", selectedCollections);

      if (error) {
        console.error("Errore nel recuperare i luoghi:", error);
      } else {
        setPlaces(data);
      }
    };

    fetchPlaces();
  }, [selectedCollections, places]);

  const getMarkerColor = (collectionId) => {
    const collection = collections.find(c => c.id === collectionId);
    return collection ? collection.color : "blue"; // Fallback a "blue" se non trova il colore
  };

  const createCustomDivIcon = (color) => {
    return L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${color}; width: 13px; height: 13px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };


  return (
    <div>
      <h2 className="mb-4 txtWhite">Seleziona le raccolte da visualizzare</h2>
      {collections.map((collection) => (
        <div key={collection.id} className="ms-4 ">
          <label>
            <input
              type="checkbox"
              checked={selectedCollections.includes(collection.id)}
              onChange={() => handleCollectionChange(collection.id)}
            />
            <span className="txtWhite ms-1 fs-5">{collection.name}</span>
          </label>
          <span
            className="btn-delete ms-2"
            onClick={() => handleDeleteCollection(collection.id)}
          >
            Elimina
          </span>
        </div>
      ))}

      <div className="container mt-3">
        <MapContainer center={[42, 12]} zoom={5} style={{ height: "500px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {places
            .filter(place => selectedCollections.includes(place.collection_id)) // Filtra i luoghi visibili
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
