import useFetchLostPropertyData from "@/customHooks/useFetchLostPropertyData";
import { FoundItemType } from "@/data/dataType.lostProperty";
import { useEffect, useState } from "react";
import "../styles/FoundItems.css";
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import DataTable from "react-data-table-component";
import { deleteFoundItem, returnFoundItem } from "@/data/IPC/IPCMessages.lostProperty";
import { tableStyles } from "@/styles/tablesStyles";
import {useForm} from 'react-hook-form'
import { modalStyle } from "@/styles/modalStyle";


export default function FoundItems(): JSX.Element {
    const { foundItems, handleGetFoundItems } = useFetchLostPropertyData();

    const [searchBarValue, setSearchBarValue] = useState('')
    const filteredItems = foundItems.filter(item => (item.ItemName || item.ID) && item.ItemName.toLocaleLowerCase().includes(searchBarValue.toLocaleLowerCase()) || item.ID.toString().includes(searchBarValue.toLocaleLowerCase()))

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<null | FoundItemType>(null);

    const [openReturnForm, setOpenReturnForm] = useState(false);

    useEffect(() => {
        if(!openModal) {
            setOpenReturnForm(false);
        }
    }, [openModal])

    const {register, handleSubmit, formState: {errors}, reset} = useForm();


    function handleOpenModal() {
        setOpenModal(true);
    }

    function handleCloseModal() {
        setOpenModal(false)
    }

    const columns = [
        {
            name: "Name",
            selector: (row: FoundItemType) => row.ItemName
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
    async function handleReturnFoundItem(data: unknown) {
        try {
            await returnFoundItem(data);
            await handleGetFoundItems();
            handleCloseModal();
            reset();
        }
        catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="found-items-component">
            <h1>Found Items</h1>
            <input value={searchBarValue} onChange={(event) => setSearchBarValue(event.target.value)} placeholder="Item Name or Aims ID"/>
            <DataTable
                columns={columns}
                data={filteredItems}
                onRowClicked={handleRowClicked}
                customStyles={tableStyles}
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
                            {modalData.FinderName && <p><b>Found By:</b> {modalData.FinderName}</p>}
                            {modalData.AIMSNumber && <p><b>Founder's AIMS:</b>{modalData.AIMSNumber}</p>}
                            <hr />
                            {modalData.PersonName && <p><b>Returned To:</b> {modalData.PersonName}</p>}
                            {modalData.AimsNumber && <p><b>Returned Person Aims Number:</b> {modalData.AimsNumber}</p>}
                            {modalData.ReturnedBy && <p><b>Returned By:</b> {modalData.ReturnedBy}</p>}
                            <div className="modal-buttons">
                            <button onClick={() => handleDeletingFoundItem(modalData.ID)} className="modal-button delete">Delete</button>
                            {!modalData.PersonName && !modalData.ReturnDate && <button onClick={() => setOpenReturnForm(true)} className="modal-button return">Return</button>}
                            </div>
                            {openReturnForm && 
                            <form onSubmit={handleSubmit((data) => handleReturnFoundItem({...data, itemID: modalData.ID}))}>
                                <p>Person Name</p>
                                <input {...register("PersonName", {required: true})}/>
                                <p>AIMS number</p>
                                <input {...register("AimsNumber", {required: true})}/>
                                <p>Returned By</p>
                                <input {...register("ReturnedBy", {required: true})}/>
                                <br />
                            <input type="submit"/>
                            </form>}
                        </div>
                    }
                </Box>
            </Modal>
        </div>
    )
}