import { useEffect, useState, useContext, useRef } from "react";
import supabase from "../supabase/client";
import Map from "../components/Map";
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
    const { collections, setCollections } = useContext(CollectionsContext);

    // se la session è presente fetcho i luoghi salvati
    useEffect(() => {
        if (session) {
            const fetchSavedPlaces = async () => {
                // recupero i dati che mi servono da saved_places
                const { data, error } = await supabase
                    .from("saved_places")
                    .select("*, collections(id, name, color)")
                    // e filtro i risultati per recuperare solo i luoghi salvati dall'utente corrente
                    .eq("user_id", session.user.id);

                if (error) {
                    // aggiorno lo stato savedPlaces con i dati recuperati dal db
                    console.error("Errore nel recupero dei luoghi:", error);
                } else {
                    // nel caso in cui data è undefined (non ho ancora iniziato a salvare luoghi) imposto un array vuoto
                    setSavedPlaces(data || []);
                }
            };
            // ora posso chiamare la funzione
            fetchSavedPlaces();
        }
    }, [session]);


    // se c'è la sessione recupero le collections dell'utente
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
    // se ho selezionato almeno una raccolta
    const filteredPlaces = selectedCollections.length > 0
        // eseguo filter su savedPlaces per prendere solo i posti della raccolta, cioè verifico se l'id della raccolta del luogo corrente è presente nella selectedCollections
        ? savedPlaces.filter(place => selectedCollections.includes(place.collection_id))
        // se non ho selezionato nessuna raccolta, visualizzo tutti i posti senza filtarli
        : savedPlaces;


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
                // aggiorno savedPlaces rimuovendo il luogo eliminato, cioè creo un nuovo array con solo i luoghi il cui ID è diverso dall'ID del luogo eliminato
                setSavedPlaces((prev) => prev.filter((place) => place.id !== id));
            }
        }
    };

    // funzione di callback che viene passata a map e aggionra le raccolte in appProfile tramite il contesot
    const updateCollections = (updatedCollections) => {
        setCollections(updatedCollections);
    };

    const handleScrollToPlace = (placeId) => {
        // trovo il posto corrispondente tramite l'id in savedPlaces
        const place = savedPlaces.find(p => p.id === placeId);
        if (!place?.latitude || !place?.longitude) return;
        // prima vado alla sezione della Map
        if (mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        // vado al marker corrispondente al luogo
        window.dispatchEvent(new CustomEvent("scrollToMarker", { detail: placeId }));

    };

    // per mostrare o meno le info del luogo
    const toggleInfo = (placeId) => {
        const details = document.querySelector(`#details-${placeId}`);
        if (details) {
            details.classList.toggle("d-none");
        }
    };

    // funzione per gestire aggiunta o rimozione delle raccolte filtrate
    const handleCollectionFilterChange = (collectionId) => {
        setSelectedCollectionsFilter(prev =>
            // verifico se la raccolta corrente sia già presente in prev
            prev.includes(collectionId)
                // se è presente devo toglierla, quindi creo un nuovo array che contiene gli Id di raccolta diversi da collectionId
                ? prev.filter(id => id !== collectionId)
                // se non è presente la aggiungo, concatenando l'array precedente (prev) con il collectionId
                : [...prev, collectionId]
        );
    };

    // funzione che filtra la lista dei luoghi in base alle raccolte.
    // dichiaro la costante filteredPlacesList il cui contenuto varierà in base alla condizione, cioè se selectedCollectionsFilter è maggiore di zero (abbiamo cioè selezionato almeno una raccolta da visualizzare)
    const filteredPlacesList = selectedCollectionsFilter.length > 0
        ? savedPlaces.filter(place =>
            // verifico che il luogo abbia un collectionId valido
            place.collection_id &&
            // verifico che la raccolta con l'id corrente sia presente in selectedCollectionsFilter
            selectedCollectionsFilter.includes(place.collection_id) &&
            // verifico che il nome del luogo includa il termine di ricerca (entrambi convertiti in minuscolo)
            place.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        // se non ho selezionato nessuna raccolta, filtro semplicemente per nome
        : savedPlaces.filter(place => place.name.toLowerCase().includes(searchTerm.toLowerCase()));


    // uso questo hook per mettere in comunicazione Search e AppProfile
    useEffect(() => {
        const handlePlaceSaved = async (event) => {
            const {data, error} = await supabase
            .from("saved_places")
            .select("*, collections(id, name, color)")
            .eq("id", event.detail.id)
            .single()

            if (error) {
                toast.error("Errore nel recupero del luogo aggiornato:", error);
                return;
            }
            // aggiorno savedPlace col nuovo luogo salvato
            setSavedPlaces((prevPlaces) => [...prevPlaces.filter(place => place.id !== event.detail.id), data]);
        };
        // aggiungo un listener all'evento placeSaved per lanciare handlePlaceSaved
        window.addEventListener("placeSaved", handlePlaceSaved);

        // rimuovo il listener quando non è più necessario
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
