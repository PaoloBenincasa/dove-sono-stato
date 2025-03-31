import React, { useState, useRef, useEffect } from 'react';
import SearchContext from './SearchContext';

const SearchContextProvider = ({ children }) => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const debounceTimeout = useRef(null);

    const searchPlaceByName = async (query) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=30`;

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Vette/1.0 (paolobenincasa1984@gmail.com)',
                },
            });

            if (!response.ok) throw new Error('Errore nella richiesta.');
            return await response.json();

        } catch (err) {
            console.error("Errore nella ricerca:", err);
            setError("Errore nella ricerca. Riprova.");
            return [];
        }
    };

    const handleSearch = async (searchValue) => {
        try {
            setLoading(true);
            setError(null);
            const data = await searchPlaceByName(searchValue);
            setPlaces(data.length > 0 ? data : []);
            setLoading(false);
        } catch (err) {
            setError("Errore nella ricerca. Riprova.");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        value.trim() 
            ? debounceTimeout.current = setTimeout(() => handleSearch(value), 500)
            : setPlaces([]);
    };

    const selectPlace = (place) => setSelectedPlace(place);

    useEffect(() => () => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    }, []);

    return (
        <SearchContext.Provider value={{ 
            places, 
            setPlaces, 
            loading, 
            error, 
            handleInputChange, 
            selectPlace, 
            selectedPlace 
        }}>
            {children}
        </SearchContext.Provider>
    );
};

export default SearchContextProvider;