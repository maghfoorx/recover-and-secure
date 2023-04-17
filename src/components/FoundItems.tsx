import useFetchLostPropertyData from "@/customHooks/useFetchLostPropertyData";
import { FoundItemType } from "@/data/Interfaces";
import { useState } from "react";
import "../styles/FoundItems.css";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import DataTable from "react-data-table-component";
import { deleteFoundItem, returnFoundItem } from "@/data/IPC/IPCMessages";

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

const DataStyles = {
    rows: {
        style: {
            cursor: "pointer"
        }
    },
    headCells: {
        style: {
            fontSize: "1.3rem",
            fontWeight: "bold"
        }
    }
}


export default function FoundItems(): JSX.Element {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<null | FoundItemType>(null);

    const { foundItems, handleGetFoundItems } = useFetchLostPropertyData();

    function handleOpenModal() {
        console.log("trying to open modal")
        setOpenModal(true);
    }

    function handleCloseModal() {
        setOpenModal(false)
    }

    const columns = [
        {
            name: "Name",
            selector: (row: FoundItemType) => row.ItemName
        },
        {
            name: "Returned",
            selector: (row: FoundItemType) => row.Returned,
            sortable: true
        }
    ]

    //function to handle when a row is clicked
    function handleRowClicked(row: FoundItemType) {
        setModalData(row)
        handleOpenModal()
    }

    //function to handle deleting an item
    async function handleDeletingFoundItem(id: number) {
        await deleteFoundItem(id);
        await handleGetFoundItems();
        handleCloseModal()
    }

    //function to handle returning a found item
    async function handleReturnFoundItem(id: number) {
        await returnFoundItem(id);
        await handleGetFoundItems();
        handleCloseModal();
    }

    return (
        <div className="found-items-component">
            <h1>Found Items</h1>
            <DataTable
                columns={columns}
                data={foundItems}
                onRowClicked={handleRowClicked}
                customStyles={DataStyles}
                pagination
            />
            {/* creating the modal */}
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
                            <p><b>Date Found:</b> {modalData.FoundDate}</p>
                            <p><b>Found Area:</b> {modalData.FoundArea}</p>
                            <p><b>Returned:</b> {modalData.Returned}</p>
                            <div className="modal-buttons">
                            <button onClick={() => handleDeletingFoundItem(modalData.ID)} className="modal-button delete">Delete</button>
                            <button onClick={() => handleReturnFoundItem(modalData.ID)} className="modal-button return">Return</button>
                            </div>
                        </div>
                    }
                </Box>
            </Modal>
        </div>
    )
}