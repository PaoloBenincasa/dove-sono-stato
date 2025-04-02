import { useState, useEffect } from "react";
import supabase from "../supabase/client";
import CollectionsContext from "./CollectionsContext"; 

const CollectionsContextProvider = ({ children }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);

  // fetcho le raccolte a ogni montaggio del componente
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


  // gestisce la selezione e deselezione di una raccolta in Map
  const handleCollectionChange = (collectionId) => {
    setSelectedCollections((prev) => {
      if (prev.includes(collectionId)) {
        // se l'id della raccolta è già presente, la rimuovo da selectedCollections
        return prev.filter((id) => id !== collectionId);
      } else {
        // altrimenti l'aggiungo
        return [...prev, collectionId];
      }
    });
  };

  // cancello la collezione
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
        // rimuovo la raccolta da collections
        setCollections((prevCollections) => prevCollections.filter((collection) => collection.id !== id));
        // aggiorno lo stato selectedCollections rimuovendo la raccolta se presente
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

export default CollectionsContextProvider; 
