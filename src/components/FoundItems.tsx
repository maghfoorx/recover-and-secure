import useFetchLostPropertyData from "@/customHooks/useFetchLostPropertyData";
import { FoundItemType } from "@/data/Interfaces";
import { useState } from "react";
import DataGrid from "react-data-grid";
import "../styles/FoundItems.css";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
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


export default function FoundItems(): JSX.Element {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<null | FoundItemType>(null);

    const { foundItems } = useFetchLostPropertyData();

    function handleOpenModal() {
        setOpenModal(true);
    }

    function handleCloseModal() {
        setOpenModal(false)
    }

    const columns = [
        { key: "ID", name: "ID", width: 10 },
        {
            key: "ItemName", name: "Name", width: 100,
            formatter: ({ row }: any) => (
                <div onClick={() => {
                    handleOpenModal
                }} style={{ cursor: "pointer" }}>{row.ItemName}</div>
            )
        },
        {
            key: "Details", name: "Details",
            formatter: ({ row }: any) => (
                <div onClick={() => {
                    handleOpenModal
                }} style={{ cursor: "pointer" }}>{row.Details}</div>
            )
        },
        { key: "FoundArea", name: "Found Area", width: 100 },
        { key: "FoundDate", name: "Date Found", width: 90 },
        { key: "Returned", name: "Returned", width: 90 }
    ]

    return (
        <div className="found-items-component">
            <h1>This is Found Items Component</h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <DataGrid columns={columns} rows={foundItems} rowKeyGetter={(row: FoundItemType) => row.ID} rowHeight={45} style={{ width: "100vw" }} className="fill-grid" />
            </div>
            {/* creating the modal */}
            <p onClick={handleOpenModal}>Open Modal</p>
            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {modalData?.ItemName}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Typography>
                </Box>
            </Modal>
        </div>
    )
}