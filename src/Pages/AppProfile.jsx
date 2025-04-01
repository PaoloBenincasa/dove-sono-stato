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
    const [searchTerm, setSearchTerm] = useState("");


    // prendo le raccolte dal contesto
    const { collections, setCollections } = useContext(CollectionsContext);

    // fetcho i luoghi salvati
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
    // const handleSave = (newPlace) => {
    //     setSavedPlaces((prevPlaces) => [...prevPlaces, newPlace]);
    // };

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
        const place = savedPlaces.find(p => p.id === placeId);
        if (!place?.latitude || !place?.longitude) return;
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
        ? savedPlaces.filter(place =>
            place.collection_id &&
            selectedCollectionsFilter.includes(place.collection_id) &&
            place.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : savedPlaces.filter(place => place.name.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
        const handlePlaceSaved = (event) => {
            setSavedPlaces((prevPlaces) => [...prevPlaces, event.detail]);
        };

        window.addEventListener("placeSaved", handlePlaceSaved);

        return () => {
            window.removeEventListener("placeSaved", handlePlaceSaved);
        };
    }, []);

    if (!session) {
        return <p>Caricamento...</p>;
    }

    return (
        <div className="profile">
            <div className="collections pt-3 pb-5 d-flex flex-column align-items-start  max-h-75 p-1 bgDarkgreen container">

                <div className="w-100">
                    <CreateCollectionForm setCollections={setCollections} collections={collections} />
                </div>
            </div>
            <div
                className="map-container"
                ref={mapSectionRef}
            >
                <Map
                    savedPlaces={filteredPlaces}
                    setSavedPlaces={setSavedPlaces}
                    updateCollections={updateCollections}
                    handleScrollToPlace={handleScrollToPlace}
                />
            </div>

            <div className="txtWhite places-list container ">
                <h4 className="pt-5 underBlue">Tutti i luoghi che hai visitato</h4>

                <div className="mb-3">
                    <h5 className="mt-3 ms-1 fs-6 txtGrey">Filtra per raccolta</h5>
                    {collections.map((collection) => (
                        <div
                            key={collection.id}
                            className={`${selectedCollectionsFilter.includes(collection.id) ? 'active' : ''}`}
                            onClick={() => handleCollectionFilterChange(collection.id)}
                            style={{
                                backgroundColor: selectedCollectionsFilter.includes(collection.id) ? collection.color : 'transparent',
                                marginLeft: '5px',
                                marginTop: '3px',
                                marginBottom: '3px',
                                paddingLeft: '8px',
                                paddingRight: '8px',
                                borderRadius: '1%',
                                cursor: 'pointer',
                                border: '1px solid grey',
                                display: 'inline-block'
                            }}
                        >
                            {selectedCollectionsFilter.includes(collection.id) ? '✓' : '+'} {collection.name}
                        </div>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Cerca tra i tuoi luoghi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control listSearch mb-3 ms-2"
                />

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
                                    // onClick={() => window.dispatchEvent(new CustomEvent("scrollToMarker", { detail: place.id }))}
                                >
                                    {mainName}
                                </span>
                                <small
                                    className="txtGrey info ms-1"
                                    onClick={() => toggleInfo(place.id)}
                                >
                                    info
                                </small>
                                <div id={`details-${place.id}`} className="d-none p-2">
                                    <div>
                                        {rest.length > 0 && <span className="secondary-name">{rest.join(",")}</span>}
                                        <small className="ps-1 btn-delete" onClick={() => handleDelete(place.id)}>
                                            elimina luogo
                                        </small>
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
