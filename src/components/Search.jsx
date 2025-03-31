import React, { useState, useRef, useEffect, useContext } from "react";
import 'react-toastify/dist/ReactToastify.css';
import SearchContext from "../context/SearchContext";
import CollectionsContext from "../context/CollectionsContext";
import supabase from "../supabase/client";
import { toast, ToastContainer } from 'react-toastify';
import MuiModal from "./MuiModal";

const searchPlaceByName = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=30`;

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Vette/1.0 (paolobenincasa1984@gmail.com)',
        },
    });

    if (!response.ok) {
        throw new Error("Errore nella richiesta.");
    }

    return await response.json();
};

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultsVisible, setResultsVisible] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const searchResultsRef = useRef(null);
    const debounceTimeout = useRef(null);

    const { setPlaces } = useContext(SearchContext);
    const { collections } = useContext(CollectionsContext);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: fetchedUser } } = await supabase.auth.getUser();
            setUser(fetchedUser);
        };
        fetchUser();
    }, []);

    const handleSearch = async (searchValue) => {
        try {
            setLoading(true);
            setError(null);
            const data = await searchPlaceByName(searchValue);

            setResults(data.length > 0 ? data : []);
            if (data.length === 0) setError("Nessun risultato trovato.");
            setLoading(false);
            setResultsVisible(true);
            setPlaces(data);

        } catch (err) {
            console.error("Errore nella ricerca:", err);
            setError("Errore nella ricerca. Riprova.");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (value.trim()) {
            debounceTimeout.current = setTimeout(() => {
                handleSearch(value);
            }, 500);
        } else {
            setResultsVisible(false);
            setResults([]);
        }
    };

    const handlePlaceClick = (place) => {
        setSelectedPlace(place);
        setOpenModal(true);
        setResultsVisible(false);
    };

    const handleSavePlace = async (place, collection) => {
        if (!user) {
            toast.error("Devi essere loggato per salvare un luogo");
            return;
        }

        if (!collection) {
            toast.error("Seleziona una raccolta");
            return;
        }

        try {
            const { error } = await supabase
                .from('saved_places')
                .insert([{
                    name: place.display_name,
                    latitude: parseFloat(place.lat),
                    longitude: parseFloat(place.lon),
                    user_id: user.id,
                    collection_id: collection,
                }]);

            if (error) {
                if (error.code === '23505') { 
                    toast.error("Questo luogo è già stato salvato in questa raccolta.");
                } else {
                    toast.error("Errore durante il salvataggio");
                    console.error('Errore nel salvataggio:', error);
                }
                return;
            }

            toast.success("Luogo salvato con successo!");
            setSelectedPlace(null);
            setOpenModal(false);

            window.dispatchEvent(new CustomEvent("placeSaved", {
                detail: {
                    name: place.display_name,
                    latitude: parseFloat(place.lat),
                    longitude: parseFloat(place.lon),
                    user_id: user.id,
                    collection_id: collection,
                },
            }))
        } catch (err) {
            console.error('Errore nel salvataggio:', err);
            toast.error("Errore durante il salvataggio");
        }
    };

    const handleClickOutside = (event) => {
        if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
            setResultsVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="p-4 d-flex justify-content-center search-nav" style={{ position: 'relative' }}>
            <input
                type="text"
                placeholder="Cerca un luogo..."
                value={query}
                onChange={handleInputChange}
                className="border p-2 rounded"
            />

            {loading &&
                <div class="d-flex justify-content-center">
                    <div class="spinner-border txtWhite ms-2" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>}
            {error && <p className="mt-4 text-danger">{error}</p>}

            {resultsVisible && (
                <div className='d-flex justify-content-center search-results'>
                    <ul ref={searchResultsRef} className="mb-0 list-unstyled w-100">
                        {results.map((place, index) => (
                            <li key={index} className="border-bottom w-100">
                                <button
                                    type="button"
                                    className="btn-results btn text-start text-decoration-none w-100"
                                    onClick={() => handlePlaceClick(place)} // Usa handlePlaceClick
                                >
                                    {place.display_name} ({place.lat}, {place.lon})
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Utilizzo del componente MuiModal */}
            {selectedPlace && (
                <MuiModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    selectedPlace={selectedPlace}
                    collections={collections}
                    onSave={handleSavePlace} // Passa la funzione di salvataggio
                />
            )}

            <ToastContainer position="bottom-right" />
        </div>
    );
}