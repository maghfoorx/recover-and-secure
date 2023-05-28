import useFetchUserAmaanatItems from '@/custom-hooks/useFetchUserAmaanatItems';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DataTable from "react-data-table-component";
import { tableStyles } from "@/styles/tablesStyles";
import { modalStyle } from "@/styles/modalStyle";
import { amaanatColumns } from '@/utils/amaanatItemsColumns';
import { AmaanatUserItemType } from '@/type-definitions/types.amaanat';
import { Box, Modal } from "@mui/material";

export default function AmaanatUserPage() {
    const { userId } = useParams();

    if(!userId) return null;

    const { amaanatItems, amaanatUser, handleGetAmaanatUser } = useFetchUserAmaanatItems({ ID: userId});

    useEffect(() => {
        handleGetAmaanatUser(userId);
    }, []);

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<null | AmaanatUserItemType>(null);

    function handleOpenModal() {
        setOpenModal(true);
    }

    function handleCloseModal() {
        setOpenModal(false)
    }

    function handleRowClicked(row: AmaanatUserItemType) {
        setModalData(row)
        handleOpenModal()
    }
    
    console.log(amaanatItems)
    return (
        <div>
            <Link to="/amaanat" className="go-back">Go Back</Link>
            <h1>{`Amaanat Items for ${amaanatUser?.Name}`}</h1>
            <Link to={`/amaanat/add-items/${userId}`}>Add Items</Link>
            <DataTable 
                columns={amaanatColumns}
                data={amaanatItems}
                customStyles={tableStyles}
                onRowClicked={handleRowClicked}
             />
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyle}>
                    {modalData
                        &&
                        <div>
                            <h1>{modalData.ID}: {modalData.ItemName}</h1>
                            <p><b>Details:</b> {modalData.ItemDetails}</p>
                            <p><b>Date Received:</b> {modalData.EntryDate}</p>
                            <p><b>Location Stored</b> {modalData.StoredLocation}</p>
                            <p><b>Returned:</b> {modalData.Returned}</p>
                            <div className="modal-buttons">
                            </div>
                        </div>
                    }
                </Box>
            </Modal>
        </div>
    )
}