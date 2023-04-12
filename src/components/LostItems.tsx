import { LostItemType } from "@/data/Interfaces";
import { useState } from "react";
import 'react-data-grid/lib/styles.css';
import "../styles/LostItems.css"
import useFetchLostPropertyData from "@/customHooks/useFetchLostPropertyData";
import { Box, Modal } from "@mui/material";
import DataTable from "react-data-table-component";

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

    //creating columns
    const columns = [
        { name: 'ID', cell: (row: LostItemType) => row.ID },
        {
            name: 'Name',
            selector: (row: LostItemType) => row.ItemName
        },
        {
            name: 'Found',
            selector: (row: LostItemType) => row.ItemFound
        }
    ]

    return (
        <div className="lost-items-component">
            <h2>Reported Lost Items</h2>
            <p>Total Lost Items: {lostItems.length}</p>
            <p>Total Found Items: {lostItems.filter(item => item.ItemFound === "Yes").length}</p>
            <DataTable
                title="Lost Items"
                columns={columns}
                data={lostItems}
                onRowClicked={handleRowClicked}
                customStyles={DataStyles}
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
                            <h1>{modalData.ItemName}</h1>
                            <p><b>Details:</b> {modalData.Details}</p>
                            <p><b>Found Area:</b> {modalData.LostArea}</p>
                            <p><b>Person Name:</b> {modalData.PersonName}</p>
                            <p><b>Found:</b> {modalData.ItemFound}</p>
                            <p><b>Returned:</b> {modalData.ItemFound}</p>
                            <button>Delete</button>
                        </div>
                    }
                </Box>
            </Modal>
        </div>
    )
}