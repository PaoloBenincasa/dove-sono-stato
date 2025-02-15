import { useEffect, useState, useContext } from "react";
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

    // seleziono le raccolte col toggle
    const toggleCollection = (collectionId) => {
        setSelectedCollections((prevSelected) =>
            prevSelected.includes(collectionId)
                ? prevSelected.filter(id => id !== collectionId)
                : [...prevSelected, collectionId]
        );
    };

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

    if (!session) {
        return <p>Caricamento...</p>;
    }

    return (
        <div className="profile">
            <div className="collections pt-5">
                <h2 className="txtWhite pt-4 ">Crea le tue raccolte</h2>
                <p className="txtGrey">organizza i tuoi posti del cuore in raccolte divise come più preferisci</p>
                <div className="">
                    <CreateCollectionForm setCollections={setCollections} collections={collections} />
                </div>
            </div>
            <div className="">
                <h2 className="mt-3 pt-5  txtWhite">Ricerca</h2>
                <Search onSave={(newPlace) => handleSave(newPlace)} />
            </div>
            <div className="map-container ">
                <Map savedPlaces={filteredPlaces} updateCollections={updateCollections} />
            </div>
            <div className="txtWhite ">
                <h2 className="pt-5">Tutti i luoghi che hai visitato</h2>
                <div className="">
                    <div className="collections-filter">
                        {collections.map(collection => (
                            <button
                                key={collection.id}
                                className={`btn ${selectedCollections.includes(collection.id) ? 'btn-cta' : 'btn-add'} ms-1`}
                                onClick={() => toggleCollection(collection.id)}
                            >
                                {collection.name}
                            </button>
                        ))}
                    </div>
                </div>
                {filteredPlaces.length > 0 ? (
                    <ul className="mt-4">
                        {filteredPlaces.map((place) => {
                            const [mainName, ...rest] = place.name.split(",");
                            return (
                                <li key={place.id} className="list-unstyled">
                                    <span className="main-name">{mainName}</span>
                                    {rest.length > 0 && (
                                        <span className="secondary-name">{rest.join(",")}</span>
                                    )}
                                    <span className="ps-1 btn-delete" onClick={() => handleDelete(place.id)}>
                                        Elimina
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p className="mt-2 txtGrey">Non hai ancora salvato nessun luogo.</p>
                )}
            </div>
        </div>
    );
}
