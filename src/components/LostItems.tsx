import { LostItemType } from "@/type-definitions/types.lostProperty";
import { useEffect, useState } from "react";
import "../styles/LostItems.css"
import useFetchLostPropertyData from "@/custom-hooks/useFetchLostPropertyData";
import { Box, Modal } from "@mui/material";
import DataTable from "react-data-table-component";
import { deleteLostItem, foundLostItem, unFoundLostItem } from "@/IPC/IPCMessages.lostProperty";
import { lostConditionalRowStyles, tableStyles } from "@/styles/tablesStyles";
import { modalStyle } from "@/styles/modalStyle";

export default function LostItems(): JSX.Element {

    const { lostItems, handleGetLostItems } = useFetchLostPropertyData();

    const [searchBarValue, setSearchBarValue] = useState('')

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<null | LostItemType>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(false);
    const [unFoundConfirmation, setUnFoundConfirmation] = useState(false);

    useEffect(() => {
        if (!openModal) {
            setDeleteConfirmation(false)
        }
    }, [openModal]);

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
        if (modalData?.ItemFound === 'No') {
            await foundLostItem(id);
            await handleGetLostItems();
            handleCloseModal();
        } else if (modalData?.ItemFound === 'Yes') {
            await unFoundLostItem(id);
            await handleGetLostItems();
            handleCloseModal();
        }
    }

    //creating columns
    const columns = [
        {
            name: 'Name',
            selector: (row: LostItemType) => row.ItemName
        },
        {
            name: 'Details',
            selector: (row: LostItemType) => row.Details
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
                conditionalRowStyles={lostConditionalRowStyles}
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
                            { !deleteConfirmation && <div className="modal-buttons">
                            <button onClick={() => setDeleteConfirmation(prev => !prev)} className="modal-button delete">Delete</button>
                            <button onClick={() => setUnFoundConfirmation(prev => !prev)} className="modal-button found">{modalData.ItemFound === 'Yes' ? 'Found' : 'UnFound'}</button>
                            </div>}
                            {deleteConfirmation && 
                            <div className="modal-buttons-confirmation">
                                <p>Are you sure you want to delete this item?</p>
                                <button onClick={() => handleDeletingLostItem(modalData.ID)} className="modal-button found">Yes</button>
                                <button onClick={() => setDeleteConfirmation(false)} className="modal-button delete">No</button>
                            </div>}
                            {unFoundConfirmation && 
                            <div className="modal-buttons-confirmation">
                                <p>Are you sure you want to un find this item?</p>
                                <button onClick={() => handleFoundLostItem(modalData.ID)} className="modal-button found">Yes</button>
                                <button onClick={() => setUnFoundConfirmation(false)} className="modal-button delete">No</button>
                            </div>}
                        </div>
                    }
                </Box>
            </Modal>
            <p>Total Lost Items: {lostItems.length}</p>
            <p>Total Found Items: {lostItems.filter(item => item.ItemFound === "Yes").length}</p>
        </div>
    )
}