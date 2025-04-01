import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import supabase from "../supabase/client";
import SearchContext from '../context/SearchContext';
import CollectionsContext from '../context/CollectionsContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast, ToastContainer } from 'react-toastify';
import PlaceMap from '../components/PlaceMap';

const AppPlace = () => {
    const { placeId } = useParams();
    const { collections } = useContext(CollectionsContext);
    const { places } = useContext(SearchContext);
    const [placeDetails, setPlaceDetails] = useState(null);
    const [selectedCollection, setSelectedCollection] = useState("");
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    console.log("placeId:", placeId); // Aggiungi questo log
    console.log("Dati in places:", places); // Aggiungi questo log

    useEffect(() => {
        const fetchPlaceData = async () => {
            try {
                // 1. Prova prima con i dati del context
                if (places?.length) {
                    const placeFromContext = places.find(p => p.place_id === parseInt(placeId));
                    if (placeFromContext) {
                        setPlaceDetails(placeFromContext);
                        return;
                    }
                }
    
                // 2. Fallback: fetch diretto via API usando l'ID
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/lookup?osm_ids=${placeId}&format=json`
                );
                
                const data = await response.json();
                setPlaceDetails(data[0]); 
            } catch (error) {
                console.error("Fetch fallback failed:", error);
            }
        };
    
        fetchPlaceData();
    }, [placeId, places]);

   



    useEffect(() => {
        const fetchUserIfNeeded = async () => {
            if (!user) {
                const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser();
                if (userError) {
                    console.error("Errore nel recupero dell'utente:", userError);
                    return;
                }
                setUser(fetchedUser);
            }
        };

        fetchUserIfNeeded();
    }, [user]);

    const handleSavePlace = async () => {
        if (!user) {
            alert("Devi essere loggato per salvare un luogo.");
            return;
        }

        if (!selectedCollection) {
            alert("Devi selezionare una raccolta.");
            return;
        }

        try {
            const { data: existingPlaces, error: checkError } = await supabase
                .from("saved_places")
                .select("*")
                .eq("user_id", user.id)
                .eq("collection_id", selectedCollection)
                .eq("name", placeDetails.display_name);

            if (checkError) throw checkError;

            if (existingPlaces.length > 0) {
                toast.error("Hai già salvato questo luogo in questa raccolta.");
                return;
            }

            const { data, error } = await supabase
                .from("saved_places")
                .insert([{
                    name: placeDetails.display_name,
                    latitude: parseFloat(placeDetails.lat),
                    longitude: parseFloat(placeDetails.lon),
                    user_id: user.id,
                    collection_id: selectedCollection,
                }])
                .select("*, collections(id, name, color)")
                .single();

            if (error) throw error;

            toast.success("Luogo salvato con successo!");
            // if (onSave) onSave(data);
        } catch (err) {
            toast.error("errore nel salvataggio")
            console.error("Errore nel salvataggio del luogo:", err);
            alert("Errore nel salvataggio. Riprova.");
        }
    };

    if (!placeDetails) {
        return <p>Dettagli del luogo non disponibili.</p>;
    }

    return (
        <div className="h-100 d-flex flex-column justify-content-center p-4 bgDarkgreen">
            <h2 className='txtWhite'>{placeDetails.display_name}</h2>

            <div style={{ height: '450px', width: '90%' }}>
                <PlaceMap 
                lat={placeDetails.lat} 
                lon={placeDetails.lon} 
                displayName={placeDetails.display_name} /> 
            </div>
            <select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="ms-1 p-1 rounded"
            >
                <option value="">Seleziona una raccolta</option>
                {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                        {collection.name}
                    </option>
                ))}
            </select>

            <button onClick={handleSavePlace} className="btn-cta ms-1">
                Aggiungi alla raccolta
            </button>
            <ToastContainer position='bottom-right' />
        </div>
    );
};

export default AppPlace;