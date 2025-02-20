import { useState, useEffect, useContext } from "react";
import supabase from "../supabase/client";
import CollectionsContext from "../context/CollectionsContext";  // Importa il contesto
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

export default function Search({ onSave }) {
    const { collections, handleCollectionChange } = useContext(CollectionsContext);  // Usa il contesto
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [selectedCollection, setSelectedCollection] = useState("");

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError(null);

        try {
            const data = await searchPlaceByName(query);
            setResults(data.length > 0 ? data : []);
            if (data.length === 0) setError("Nessun risultato trovato.");
        } catch (err) {
            setError("Errore nella ricerca. Riprova.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUser = async () => {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            console.error("Errore nel recupero dell'utente:", userError);
            return;
        }
        setUser(user);
    };

    useEffect(() => {
        fetchUser();
    }, []);


    const handleSavePlace = async (place) => {
    if (!user) {
        alert("Devi essere loggato per salvare un luogo.");
        return;
    }

    if (!selectedCollection) {
        alert("Devi selezionare una raccolta.");
        return;
    }

    try {
        // Controllo se il luogo esiste già
        const { data: existingPlaces, error: checkError } = await supabase
            .from("saved_places")
            .select("*")
            .eq("user_id", user.id)
            .eq("collection_id", selectedCollection)
            .eq("name", place.display_name);

        if (checkError) throw checkError;

        if (existingPlaces.length > 0) {
            // alert("Hai già salvato questo luogo in questa raccolta.");
            toast.error("Hai già salvato questo luogo in questa raccolta.")
            return;
        }

        // Se non esiste, procedi con l'inserimento
        const { data, error } = await supabase
            .from("saved_places")
            .insert([{
                name: place.display_name,
                latitude: parseFloat(place.lat),
                longitude: parseFloat(place.lon),
                user_id: user.id,
                collection_id: selectedCollection,
            }])
            .select("*, collections(id, name, color)")
            .single();

        if (error) throw error;

        // alert("Luogo salvato con successo!");
        toast.success("luogo salvato con successo!")
        if (onSave) onSave(data);
    } catch (err) {
        console.error("Errore nel salvataggio del luogo:", err);
        alert("Errore nel salvataggio. Riprova.");
    }
};


    return (
        <div className="p-4">
            <input
                type="text"
                placeholder="Cerca un luogo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border p-2 rounded txtDarkgreen"
            />
            <span onClick={handleSearch} className="ms-1 mb-1 btn btn-search">
                Cerca
            </span>

            {loading && <p className="mt-4 text-blue-500">Caricamento...</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}

            {!loading && results.length > 0 && (
                <ul className="mt-4">
                    {results.map((place, index) => (
                        <li key={index} className="txtWhite p-1">
                            {place.display_name} ({place.lat}, {place.lon})

                            {collections.length > 0 && (
                                <select
                                    onChange={(e) => setSelectedCollection(e.target.value)}
                                    className="ms-1  p-1 rounded txtDarkgreen"
                                >
                                    <option value="">Seleziona una raccolta</option>
                                    {collections.map((collection) => (
                                        <option key={collection.id} value={collection.id}>
                                            {collection.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <span onClick={() => handleSavePlace(place)} className="btn-add ms-1">
                                Aggiungi
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
