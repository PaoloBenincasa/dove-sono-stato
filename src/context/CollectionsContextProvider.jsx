import { useState, useEffect } from "react";
import supabase from "../supabase/client";
import CollectionsContext from "./CollectionsContext"; // Importa il context

const CollectionsContextProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  // Carica tutte le raccolte dell'utente
  useEffect(() => {
    const fetchCollections = async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*");

      if (error) {
        console.error("Errore nel recuperare le raccolte:", error);
      } else {
        setCollections(data);
      }
    };

    fetchCollections();
  }, []);

  // Aggiungi o rimuovi una raccolta dalle selezioni
  const handleCollectionChange = (collectionId) => {
    setSelectedCollections((prev) => {
      if (prev.includes(collectionId)) {
        return prev.filter((id) => id !== collectionId);
      } else {
        return [...prev, collectionId];
      }
    });
  };

  // Elimina una raccolta
  const handleDeleteCollection = async (id) => {
    const confirmDelete = window.confirm("Sei sicuro di voler eliminare questa raccolta?");
    
    if (confirmDelete) {
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Errore nell'eliminazione della raccolta:", error);
      } else {
        setCollections((prevCollections) => prevCollections.filter((collection) => collection.id !== id));
        setSelectedCollections((prev) => prev.filter((collectionId) => collectionId !== id));
      }
    }
  };

  return (
    <CollectionsContext.Provider value={{
      collections,
      setCollections,
      selectedCollections,
      handleCollectionChange,
      handleDeleteCollection
    }}>
      {children}
    </CollectionsContext.Provider>
  );
}

export default CollectionsContextProvider;  // Assicurati che l'export sia default
