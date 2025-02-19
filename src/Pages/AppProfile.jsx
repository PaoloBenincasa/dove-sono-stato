import { useEffect, useState, useContext, useRef } from "react";
import supabase from "../supabase/client";
import Map from "../components/Map";
import Search from "../components/Search";
import CreateCollectionForm from "../components/CreateCollectionForm";
import SessionContext from "../context/SessionContext";
import CollectionsContext from "../context/CollectionsContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AppProfile() {
    const [savedPlaces, setSavedPlaces] = useState([]);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const session = useContext(SessionContext);
    const placeRefs = useRef({});
    const mapSectionRef = useRef(null);
    const [selectedCollectionsFilter, setSelectedCollectionsFilter] = useState([]);





    // Ottieni le raccolte dal contesto
    const { collections, setCollections } = useContext(CollectionsContext);

    // Fetch dei luoghi salvati
    useEffect(() => {
        if (session) {
            const fetchSavedPlaces = async () => {
                const { data, error } = await supabase
                    .from("saved_places")
                    .select("*, collections(id, name, color)")
                    .eq("user_id", session.user.id);

                if (error) {
                    console.error("Errore nel recupero dei luoghi:", error);
                } else {
                    setSavedPlaces(data || []);
                }
            };
            fetchSavedPlaces();
        }
    }, [session]);

    useEffect(() => {
        if (session) {
            const fetchCollections = async () => {
                const { data, error } = await supabase
                    .from("collections")
                    .select("*")
                    .eq("user_id", session.user.id);

                if (error) {
                    console.error("Errore nel recupero delle raccolte:", error);
                } else {
                    setCollections(data || []);
                }
            };
            fetchCollections();
        }
    }, [session]);


    // filtro i luoghi in base alla raccolta selezionata
    const filteredPlaces = selectedCollections.length > 0
        ? savedPlaces.filter(place => selectedCollections.includes(place.collection_id))
        : savedPlaces;


    // aggiungo un nuovo luogo alla lista
    const handleSave = (newPlace) => {
        setSavedPlaces((prevPlaces) => [...prevPlaces, newPlace]);
    };

    // elimino un luogo
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Sei sicuro di voler eliminare questo luogo?");

        if (confirmDelete) {
            const { error } = await supabase
                .from("saved_places")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("Errore nell'eliminazione del luogo:", error);
            } else {
                setSavedPlaces((prev) => prev.filter((place) => place.id !== id));
            }
        }
    };

    const updateCollections = (updatedCollections) => {
        setCollections(updatedCollections);
    };

    const handleScrollToPlace = (placeId) => {
        // prima vado alla sezione della Map
        if (mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // vado al marker corrispondente al luogo
        window.dispatchEvent(new CustomEvent("scrollToMarker", { detail: placeId }));

    };

    const toggleInfo = (placeId) => {
        const details = document.querySelector(`#details-${placeId}`);
        if (details) {
            details.classList.toggle("d-none");
        }
    };

    const handleCollectionFilterChange = (collectionId) => {
        setSelectedCollectionsFilter(prev =>
            prev.includes(collectionId)
                ? prev.filter(id => id !== collectionId) 
                : [...prev, collectionId] 
        );
    };

    const filteredPlacesList = selectedCollectionsFilter.length > 0
        ? savedPlaces.filter(place => place.collection_id && selectedCollectionsFilter.includes(place.collection_id))
        : savedPlaces;



    if (!session) {
        return <p>Caricamento...</p>;
    }

    return (
        <div className="profile">
            <div className="collections pt-5">
                <h4 className="txtWhite pt-4 ">Crea le tue raccolte</h4>
                <p className="txtGrey">organizza i tuoi posti del cuore in raccolte divise come più preferisci</p>
                <div className="">
                    <CreateCollectionForm setCollections={setCollections} collections={collections} />
                </div>
            </div>
            <div className="">
                <h4 className="mt-3 pt-5  txtWhite">Ricerca</h4>
                <Search onSave={(newPlace) => handleSave(newPlace)} />
            </div>
            <div className="map-container " ref={mapSectionRef}>
                <Map
                    savedPlaces={filteredPlaces}
                    updateCollections={updateCollections}
                    handleScrollToPlace={handleScrollToPlace}
                />
            </div>
        
            <div className="txtWhite places-list ">
                <h4 className="pt-5">Tutti i luoghi che hai visitato</h4>

                {/* Checkbox per filtrare per collezione */}
                <div className="mb-3">
                    <h5 className="mt-3">Filtra per raccolta</h5>
                    {collections.map((collection) => (
                        <div key={collection.id} className="ms-4">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedCollectionsFilter.includes(collection.id)}
                                    onChange={() => handleCollectionFilterChange(collection.id)}
                                />
                                <span className="ms-2">{collection.name}</span>
                            </label>
                        </div>
                    ))}
                </div>

                <ul className="mt-4">
                    {filteredPlacesList.map((place) => {
                        const [mainName, ...rest] = place.name.split(",");

                        return (
                            <li
                                key={place.id}
                                ref={(el) => (placeRefs.current[place.id] = el)}
                                className="list-unstyled"
                            >
                                <span
                                    className="main-name"
                                    onClick={() => handleScrollToPlace(place.id)}
                                >
                                    {mainName}
                                </span>
                                <span
                                    className="txtGrey info ms-1"
                                    onClick={() => toggleInfo(place.id)}
                                >
                                    info
                                </span>
                                <div id={`details-${place.id}`} className="d-none p-2">
                                    <div>
                                        {rest.length > 0 && <span className="secondary-name">{rest.join(",")}</span>}
                                        <span className="ps-1 btn-delete" onClick={() => handleDelete(place.id)}>
                                            Elimina luogo
                                        </span>
                                    </div>
                                    <div>
                                        <span
                                            style={{
                                                backgroundColor: place.collections?.color || "gray",
                                                borderRadius: "50%",
                                                height: "12px",
                                                width: "12px",
                                                display: "inline-block"
                                            }}
                                        ></span>
                                        <span className="ms-2">
                                            {place.collections?.name || "Senza nome"}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
