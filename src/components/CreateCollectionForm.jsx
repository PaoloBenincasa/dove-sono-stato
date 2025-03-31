import { useState, useContext } from "react";
import CollectionsContext from '../context/CollectionsContext';
import SessionContext from '../context/SessionContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import supabase from "../supabase/client";

const CreateCollectionForm = () => {
    const { collections, setCollections } = useContext(CollectionsContext);
    const [collectionName, setCollectionName] = useState("");
    const [collectionColor, setCollectionColor] = useState("#000000");
    const session = useContext(SessionContext);


    const createCollection = async () => {
        if (!collectionName.trim()) return;

        try {
            const { data, error } = await supabase
                .from("collections")
                .insert([{
                    user_id: session.user.id,
                    name: collectionName,
                    color: collectionColor
                }])
                .select();

            if (error) {
                console.error("Errore nella creazione della raccolta:", error);
                return;
            }

            setCollections(prevCollections => [...prevCollections, ...data]);

            setCollectionName("");
            setCollectionColor("#000000");

            toast.success("Raccolta creata con successo!");
        } catch (error) {
            console.error("Errore durante la creazione della raccolta:", error);
            toast.error("Si è verificato un errore.");
        }
    };

    return (
        <div className="w-100 container">
            <h4 className="pt-5 underBlue txtWhite">Crea le tue raccolte</h4>
            <p className="txtGrey ms-3">organizza i tuoi posti del cuore in raccolte divise come più preferisci</p>
            <form
                className="d-flex flex-column align-items-start gap-3 ms-3"
                onSubmit={(e) => {
                    e.preventDefault();
                    createCollection();
                }}>
                <input
                    type="text"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    placeholder="Nome raccolta"
                    required
                    className="form-control create-name"
                />
                <div>
                    <label htmlFor="color" className="txtWhite">Scegli il colore</label>
                    <input
                        type="color"
                        className="ms-2"
                        value={collectionColor}
                        onChange={(e) => setCollectionColor(e.target.value)}
                    />
                </div>
                <div className="">
                    <button type="submit" className="btn btn-search ">Crea raccolta</button>
                </div>
            </form>

            <ToastContainer position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default CreateCollectionForm;
