import { LostItemType } from "@/type-definitions/dataType.lostProperty";
import { useState } from "react";
import "../styles/LostItems.css"
import useFetchLostPropertyData from "@/customHooks/useFetchLostPropertyData";
import { Box, Modal } from "@mui/material";
import DataTable from "react-data-table-component";
import { deleteLostItem, foundLostItem } from "@/IPC/IPCMessages.lostProperty";
import { tableStyles } from "@/styles/tablesStyles";
import { modalStyle } from "@/styles/modalStyle";

export default function LostItems(): JSX.Element {

    const { lostItems, handleGetLostItems } = useFetchLostPropertyData();

    const [searchBarValue, setSearchBarValue] = useState('')

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<null | LostItemType>(null);

    const filteredItems = lostItems.filter(item => (item.ItemName || item.AimsID) && item.ItemName.toLocaleLowerCase().includes(searchBarValue.toLocaleLowerCase()) || item.AimsID.toString().includes(searchBarValue.toLocaleLowerCase()))


    function handleOpenModal() {
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
            <input value={searchBarValue} onChange={(event) => setSearchBarValue(event.target.value)} placeholder="Item Name or AIMS ID"/>
            <DataTable
                columns={columns}
                data={filteredItems}
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