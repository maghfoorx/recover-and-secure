import { LostItemType } from "@/data/Interfaces";
import { useState } from "react";
import 'react-data-grid/lib/styles.css';
import "../styles/LostItems.css"
import useFetchLostPropertyData from "@/customHooks/useFetchLostPropertyData";
import { Box, Modal } from "@mui/material";
import DataTable from "react-data-table-component";
import { deleteLostItem, foundLostItem } from "@/data/IPC/IPCMessages";
import { tableStyles } from "@/styles/tablesStyles";

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function LostItems(): JSX.Element {

    //Popupstate declaration

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<null | LostItemType>(null);

    const { lostItems, handleGetLostItems } = useFetchLostPropertyData();

    function handleOpenModal() {
        console.log("trying to open modal")
        setOpenModal(true);
    }

    function handleCloseModal() {
        setOpenModal(false)
    }

    function handleRowClicked(row: LostItemType) {
        setModalData(row)
        handleOpenModal()
    }

    async function handleDeletingLostItem(id: number) {
        await deleteLostItem(id)
        await handleGetLostItems()
        handleCloseModal()
    }

    async function handleFoundLostItem(id: number) {
        await foundLostItem(id);
        await handleGetLostItems();
        handleCloseModal();
    }

    //creating columns
    const columns = [
        {
            name: 'Name',
            selector: (row: LostItemType) => row.ItemName
        },
        {
            name: 'Found',
            selector: (row: LostItemType) => row.ItemFound,
            sortable: true
        }
    ]

    return (
        <div className="lost-items-component">
            <h1>Lost Items</h1>
            <DataTable
                columns={columns}
                data={lostItems}
                onRowClicked={handleRowClicked}
                customStyles={tableStyles}
                pagination
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
                            <p><b>Details:</b> {modalData.Details}</p>
                            <p><b>Person Name:</b> {modalData.PersonName}</p>
                            <p><b>Contact No:</b> {modalData.PhoneNumber}</p>
                            <p><b>Aims ID:</b> {modalData.AimsID}</p>
                            <p><b>Lost Area:</b> {modalData.LostArea}</p>
                            <p><b>Found:</b> {modalData.ItemFound}</p>
                            <div className="modal-buttons">
                            <button onClick={() => handleDeletingLostItem(modalData.ID)} className="modal-button delete">Delete</button>
                            <button onClick={() => handleFoundLostItem(modalData.ID)} className="modal-button found">Found</button>
                            </div>
                        </div>
                    }
                </Box>
            </Modal>
            <p>Total Lost Items: {lostItems.length}</p>
            <p>Total Found Items: {lostItems.filter(item => item.ItemFound === "Yes").length}</p>
        </div>
    )
}