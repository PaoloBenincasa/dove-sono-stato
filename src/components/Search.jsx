import React, { useState, useRef, useEffect, useContext } from "react";
import 'react-toastify/dist/ReactToastify.css';
import SearchContext from "../context/SearchContext";
import CollectionsContext from "../context/CollectionsContext";
import SessionContext from "../context/SessionContext";
import supabase from "../supabase/client";
import { toast } from 'react-toastify';
import MuiModal from "./MuiModal";

// chiamata api per cercare i luoghi, encodeuricomponent serve a codificare la stringa di ricerca, gestendo spazi e caratteri speciali
const searchPlaceByName = async (query) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=100`;

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
    const session = useContext(SessionContext);

    // al montaggio del componente recupero i dati dell'utente loggato
    useEffect(() => {
        const fetchUser = async () => {
            // estraggo la proprietà user dall'oggetto data e l'assegno alla variabile fetchedUser; await sospende l'esecuzione di fetchUser finchè la promise restituita da supabase.auth.getUser non viene risolta
            const { data: { user: fetchedUser } } = await supabase.auth.getUser();
            // aggiorno lo stato con i dati dell'utente
            setUser(fetchedUser);
        };
        fetchUser();
    }, []);

    // per gestire la ricerca
    const handleSearch = async (searchValue) => {
        try {
            setLoading(true);
            setError(null);
            // aspetto i dati da searchPlaceByName, a cui viene passata searchValue cioè la stringa di ricerca
            const data = await searchPlaceByName(searchValue);
            // se i risultati ci sono viene impostato results con data, altrimenti array vuoto
            setResults(data.length > 0 ? data : []);
            if (data.length === 0) setError("Nessun risultato trovato.");
            setLoading(false);
            // rendo visibili i risultati
            setResultsVisible(true);
            setPlaces(data);

        } catch (err) {
            console.error("Errore nella ricerca:", err);
            setError("Errore nella ricerca. Riprova.");
            setLoading(false);
        }
    };

    // gestisco il cambiamento del valore dell'input di ricerca
    const handleInputChange = (e) => {
        // recupero il valore corrente dell'input dall'evento e 
        const value = e.target.value;
        // aggiorno la query con il nuovo valore
        setQuery(value);

        // inserisco un debounce
        if (debounceTimeout.current) {
            // se l'utente digita, il timeut precedente viene annullato
            clearTimeout(debounceTimeout.current);
        }
        // con trim tolgo gli spazi bianchi; verifico che value non sia vuoto
        if (value.trim()) {
            // se non è vuoto imposto timeout di mezzo secondo dopo il quale viene chiamata handleSearch
            debounceTimeout.current = setTimeout(() => {
                handleSearch(value);
            }, 500);
        } else {
            // se è vuoto rendo i risultati non visibili e li reimposto come array vuoto
            setResultsVisible(false);
            setResults([]);
        }
    };

    // gestisco il click su un risultato della ricerca
    const handlePlaceClick = (place) => {
        // passo il place allo stato selectedPlace i cui dettagli poi vedrò nel modale
        setSelectedPlace(place);
        // apro il modale
        setOpenModal(true);
        // chiudo la ricerca
        setResultsVisible(false);
        // reimposto la ricerca a stringa vuota
        setQuery("");
    };

    
    // gestisco il salvataggio del luogo nel db
    const handleSavePlace = async (place, collection) => {
        if (!session) {
            toast.error("Devi essere loggato per salvare un luogo");
            return;
        }
    
        if (!collection) {
            toast.error("Seleziona una raccolta");
            return;
        }
    
        try {
            // salvo nel database
            const { data, error } = await supabase
                .from('saved_places')
                .insert([{
                    name: place.display_name,
                    latitude: parseFloat(place.lat),
                    longitude: parseFloat(place.lon),
                    user_id: user.id,
                    collection_id: collection,
                }])
                // aggiungo .select() per ottenere l'ID del luogo inserito
                .select(); 
    
            if (error) {
                if (error.code === '23505') {
                    toast.error("Questo luogo è già stato salvato in questa raccolta.");
                } else {
                    toast.error("Errore durante il salvataggio");
                    console.error('Errore nel salvataggio:', error);
                }
                return;
            }
            // verifico se data è truthy cioè se contiene dati
            if (data && data.length > 0) {
                toast.success("Luogo salvato con successo!");
                // reimposto il luogo selezionato a null
                setSelectedPlace(null);
                // chiudo il modale
                setOpenModal(false);
    
                // notifico ad appProfile che ho salvato un place
                window.dispatchEvent(new CustomEvent("placeSaved", {
                    detail: data[0], 
                }));
    
                // invio l'evento scrolltomarker per notificare a map di scrollare al marker del luogo salvato
                window.dispatchEvent(new CustomEvent("scrollToMarker", {
                    detail: data[0].id, 
                }));
            } else {
                toast.error("Errore durante il salvataggio: nessun dato restituito.");
                console.error('Errore nel salvataggio: nessun dato restituito.');
            }
    
        } catch (err) {
            console.error('Errore nel salvataggio:', err);
            toast.error("Errore durante il salvataggio");
        }
    };

    
    const handleClickOutside = (event) => {
        // searchResultsRef creato con useRef indica i risultati della ricerca; event.target è dove clicco; se clicco fuori dai risultati chiudo i risultati e reimposto la ricerca a stringa vuota
        if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
            setResultsVisible(false);
            setQuery("");
        }
    };

    // innesca handleClickOutside al click
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
                className="border p-2 rounded input-search"
            />

            {loading &&
                <div className="d-flex justify-content-center loading">
                    <div className="spinner-border txtWhite ms-2" role="status">
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
                                    onClick={() => handlePlaceClick(place)} 
                                >
                                    {place.display_name}
                                    {/* ({place.lat}, {place.lon}) */}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedPlace && (
                <MuiModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    selectedPlace={selectedPlace}
                    collections={collections}
                    onSave={handleSavePlace} 
                />
            )}

        </div>
    );
}