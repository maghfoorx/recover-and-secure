import useFetchLostPropertyData from "@/customHooks/useFetchLostPropertyData";
import { FoundItemType } from "@/data/Interfaces";
import { useState } from "react";
import "../styles/FoundItems.css";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
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


export default function FoundItems(): JSX.Element {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<null | FoundItemType>(null);

    const { foundItems } = useFetchLostPropertyData();

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
            cell: (row: FoundItemType) => <p>{row.ItemName}</p>
        },
        {
            name: "Details",
            selector: (row: FoundItemType) => row.Details
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

    return (
        <div className="found-items-component">
            <h1>This is Found Items Component</h1>
            <DataTable
                title="Found Items"
                columns={columns}
                data={foundItems}
                onRowClicked={handleRowClicked}
                customStyles={DataStyles}
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
                            <h1>{modalData.ItemName}</h1>
                            <p><b>Details:</b> {modalData.Details}</p>
                            <p><b>Date Found:</b> {modalData.FoundDate}</p>
                            <p><b>Found Area:</b> {modalData.FoundArea}</p>
                            <p><b>Returned:</b> {modalData.Returned}</p>
                            <button>Delete</button>
                        </div>
                    }
                </Box>
            </Modal>
        </div>
    )
}