import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PlaceMap from './PlaceMap';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import SessionContext from '../context/SessionContext';
import { useContext } from 'react';
import { Link } from 'react-router';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function MuiModal({ open, onClose, selectedPlace, collections, onSave }) {
    const [selectedCollection, setSelectedCollection] = useState('');
    const anchorRef = useRef(null);
    const session = useContext(SessionContext);

    // const handleSavePlace = () => {

    //     if (selectedCollection && onSave) {
    //         onSave(selectedPlace, selectedCollection);
    //         onClose();
    //     } else {
    //         alert("Seleziona una raccolta prima di salvare il luogo!");
    //     }
    // };

    const handleSavePlace = () => {
        if (!selectedCollection) {
            alert("Seleziona una raccolta prima di salvare il luogo!");
            return;
        }
    
        if (onSave) {
            onSave(selectedPlace, selectedCollection);
            onClose();
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '52%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: {
                    xs: '90%',
                    sm: '80%',
                    md: 600,
                },
                border: '2px solid #000',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {selectedPlace?.display_name}
                </Typography>
                <div style={{ height: '400px', width: '100%' }}>
                    {selectedPlace && (
                        <PlaceMap
                            lat={selectedPlace.lat}
                            lon={selectedPlace.lon}
                            displayName={selectedPlace.display_name}
                        />
                    )}
                </div>
                {session ?

                    <div className="mt-3 mb-3">
                        <FormControl fullWidth>
                            <InputLabel id="select-collection-label">Seleziona una raccolta</InputLabel>
                            <Select
                                labelId="select-collection-label"
                                id="select-collection"
                                value={selectedCollection}
                                label="Seleziona una raccolta"
                                onChange={(e) => setSelectedCollection(e.target.value)}
                                MenuProps={{
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                    },
                                }}
                                ref={anchorRef}
                            >

                                {collections.map((collection) => (
                                    <MenuItem key={collection.id} value={collection.id}>
                                        {collection.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div> : null
                }
                <div className='d-flex justify-content-between w-100'>
                    {session ?

                        <div
                            type="button"
                            className="btn-search btn"
                            onClick={handleSavePlace}
                            disabled={!selectedCollection}
                        >
                            Salva
                        </div> :
                        <div className='mt-2'>
                            <i class="bi bi-exclamation-diamond-fill txtRed"></i> Devi essere loggato per salvare un luogo!  <Link to="/signin" onClick={onClose} className="log text-decoration-none">Accedi</Link>
                        </div>
                    }

                    <Button onClick={onClose}>Chiudi</Button>
                </div>
            </Box>
        </Modal >
    );
}

export default MuiModal;