// import { useContext, useEffect, useState, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import 'leaflet/dist/leaflet.css';
// import L from "leaflet";
// import supabase from "../supabase/client";
// import CollectionsContext from "../context/CollectionsContext";
// import SessionContext from "../context/SessionContext";


// export default function Map({ savedPlaces }) {
//   const { collections, selectedCollections, handleCollectionChange, handleDeleteCollection } = useContext(CollectionsContext);
//   const mapRef = useRef(null);
//   const places = savedPlaces.filter(place => selectedCollections.includes(place.collection_id));
//   const placeRefs = useRef({});
//   const filteredPlacesList = places;
//   const mapSectionRef = useRef(null);
//   const [saved_places, setSavedPlaces] = useState([]);
//   const session = useContext(SessionContext);


//   const getMarkerColor = (collectionId) => {
//     const collection = collections.find(c => c.id === collectionId);
//     return collection ? collection.color : "blue";
//   };

//   const createCustomDivIcon = (color) => {
//     return L.divIcon({
//       className: "custom-div-icon",
//       html: `<div style="background-color: ${color}; width: 13px; height: 13px; border-radius: 50%; border: 2px solid white;"></div>`,
//       iconSize: [20, 20],
//       iconAnchor: [10, 10]
//     });
//   };

//   useEffect(() => {
//     const handleScrollToMarker = (event) => {
//       const placeId = event.detail;
//       const place = savedPlaces.find((p) => p.id === placeId);

//       if (place && mapRef.current) {
//         console.log(`Spostando la mappa a: ${place.latitude}, ${place.longitude}`);
//         mapRef.current.flyTo([place.latitude, place.longitude], 15, { animate: true });
//       }
//     };

//     window.addEventListener("scrollToMarker", handleScrollToMarker);
//     return () => {
//       window.removeEventListener("scrollToMarker", handleScrollToMarker);
//     };
//   }, [savedPlaces]);

//   const handleScrollToPlace = (placeId) => {
//     if (mapSectionRef.current) {
//       mapSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
//     }

//     console.log(`Evento scrollToMarker inviato per il placeId: ${placeId}`);
//     window.dispatchEvent(new CustomEvent("scrollToMarker", { detail: placeId }));
//   };



//   const toggleInfo = (placeId) => {
//     const details = document.querySelector(`#details-${placeId}`);
//     if (details) {
//       details.classList.toggle("d-none");
//     }
//   };

//   useEffect(() => {
//     if (session) {
//       const fetchSavedPlaces = async () => {
//         const { data, error } = await supabase
//           .from("saved_places")
//           .select("*, collections(id, name, color)")
//           .eq("user_id", session.user.id);

//         if (error) {
//           console.error("Errore nel recupero dei luoghi:", error);
//         } else {
//           setSavedPlaces(data || []);
//         }
//       };
//       fetchSavedPlaces();
//     }
//   }, [session]);

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Sei sicuro di voler eliminare questo luogo?");

//     if (confirmDelete) {
//       console.log(`Eliminando il luogo con id: ${id}`);

//       const { error } = await supabase
//         .from("saved_places")
//         .delete()
//         .eq("id", id);

//       if (error) {
//         console.error("Errore nell'eliminazione del luogo:", error);
//       } else {
//         console.log("Luogo eliminato correttamente");

//         // Rimuovi il luogo dallo stato savedPlaces
//         setSavedPlaces((prev) => prev.filter((place) => place.id !== id));

//         // Rimuovi il marker dalla mappa
//         if (placeRefs.current[id]) {
//           placeRefs.current[id].remove();
//           delete placeRefs.current[id]; // Rimuovi il riferimento al marker
//         }
//       }
//     }
//   };










//   return (
//     <div>
//       <h4 className="mb-4 txtWhite">Seleziona le raccolte da visualizzare</h4>
//       {collections.map((collection) => (
//         <div key={collection.id} className="ms-4 ">
//           <label>
//             <input
//               type="checkbox"
//               checked={selectedCollections.includes(collection.id)}
//               onChange={() => handleCollectionChange(collection.id)}
//             />
//             <span className="txtWhite ms-1 fs-5">{collection.name}</span>
//           </label>
//           <span
//             className="btn-delete ms-2"
//             onClick={() => handleDeleteCollection(collection.id)}
//           >
//             Elimina
//           </span>
//         </div>
//       ))}



//       <div className="container mt-5 pt-5" ref={mapSectionRef}>
//         <MapContainer
//           ref={mapRef}
//           center={[42, 12]}
//           zoom={5}
//           style={{ height: "500px", width: "100%" }}
//         >
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//           {places
//             .filter(place => selectedCollections.includes(place.collection_id)) // Filtra i luoghi visibili
//             .map((place) => (
//               <Marker
//                 key={place.id}
//                 position={[place.latitude, place.longitude]}
//                 icon={createCustomDivIcon(getMarkerColor(place.collection_id))}

//               >
//                 <Popup>{place.name}</Popup>
//               </Marker>
//             ))}
//         </MapContainer>
//       </div>

//       <ul className="mt-4">
//         {filteredPlacesList.map((place) => {
//           const [mainName, ...rest] = place.name.split(",");

//           return (
//             <li
//               key={place.id}
//               ref={(el) => (placeRefs.current[place.id] = el)}
//               className="list-unstyled txtWhite"
//             >
//               <span className="main-name" onClick={() => handleScrollToPlace(place.id)}>
//                 {mainName}
//               </span>
//               <span className="txtGrey info ms-1" onClick={() => toggleInfo(place.id)}>
//                 info
//               </span>
//               <div id={`details-${place.id}`} className="d-none p-2">
//                 <div>
//                   {rest.length > 0 && <span className="secondary-name">{rest.join(",")}</span>}
//                   <span className="ps-1 btn-delete" onClick={() => handleDelete(place.id)}>
//                     Elimina luogo
//                   </span>
//                 </div>
//                 <div>
//                   <span
//                     style={{
//                       backgroundColor: place.collections?.color || "gray",
//                       borderRadius: "50%",
//                       height: "12px",
//                       width: "12px",
//                       display: "inline-block"
//                     }}
//                   ></span>
//                   <span className="ms-2">
//                     {place.collections?.name || "Senza nome"}
//                   </span>
//                 </div>
//               </div>
//             </li>
//           );
//         })}
//       </ul>



//     </div>
//   );
// }

import { useContext, useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import supabase from "../supabase/client";
import CollectionsContext from "../context/CollectionsContext"; // Importa il context


export default function Map({ savedPlaces }) {
  const { collections, selectedCollections, handleCollectionChange, handleDeleteCollection } = useContext(CollectionsContext);
  const mapRef = useRef(null);
  const places = savedPlaces.filter(place => selectedCollections.includes(place.collection_id));


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
    <div>
      <h4 className="mb-4 txtWhite underBlue">Seleziona le raccolte da visualizzare</h4>
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
        <MapContainer ref={mapRef} center={[42, 12]} zoom={5} style={{ height: "500px", width: "100%" }}>
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