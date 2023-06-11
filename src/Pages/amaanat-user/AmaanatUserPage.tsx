import useFetchUserAmaanatItems from '@/custom-hooks/useFetchUserAmaanatItems';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DataTable from "react-data-table-component";
import { tableStyles } from "@/styles/tablesStyles";
import { modalStyle } from "@/styles/modalStyle";
import { AmaanatUserItemType } from '@/type-definitions/types.amaanat';
import { Box, Modal } from "@mui/material";
import { formatBoolean } from '@/utils/formatBoolean';
import "./amaanat-user-page.css";
import { returnAmaanatItem } from '@/IPC/IPCMessages.amaanat';
import { formatDate } from '@/utils/formatDate';

export default function AmaanatUserPage() {
    const { userId } = useParams();

    if(!userId) return null;

    const { amaanatItems, amaanatUser, handleGetAmaanatUser, handleGetUserAmaanatItems } = useFetchUserAmaanatItems({ ID: userId});

    useEffect(() => {
        handleGetAmaanatUser(userId);
    }, []);

    
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [modalData, setModalData] = useState<null | AmaanatUserItemType>(null);
    const [selectedItems, setSelectedItems] = useState<AmaanatUserItemType[]>([]);
    const [formOpen, setFormOpen] = useState(false);
    const [returnedByName, setReturnedByName] = useState("");
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    useEffect(() => {
        if(clearSelectedRows) {
            setClearSelectedRows(false)
        }
    }, [clearSelectedRows])


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

    console.log(selectedItems)
    const handleReturnItemsClicked = () => {
        setFormOpen(true)
    }

    const handleReturningItems = async () => {
        for (const item of selectedItems) {
            await returnAmaanatItem({
                id: item.ID,
                returnedBy: returnedByName
            })
        };
        amaanatUser && handleGetUserAmaanatItems(amaanatUser?.ID);
        setSelectedItems([]);
        setFormOpen(false);
        setClearSelectedRows(true);
    }

    const amaanatColumns = [
        {
            name: 'Name',
            selector: (row: AmaanatUserItemType) => row.ItemName
        },
        {
            name: 'Stored Location',
            selector: (row: AmaanatUserItemType) => row.StoredLocation
        },
        {
            name: 'Returned',
            selector: (row: AmaanatUserItemType) => formatBoolean(row.Returned)
        }
    ]
    console.log(clearSelectedRows, 'is the boolean value')
    
    return (
        <div className='amaanat-user-page'>
            <div className='links'>
            <Link to="/amaanat" className="go-back">Go Back</Link>
            <Link to={`/amaanat/add-items/${userId}`} className='link-add-items'>Add Items</Link>
            </div>
            <div>
            <h1>{amaanatUser?.Name}</h1>
            <h2>AIMS: {amaanatUser?.AIMSNo}</h2>
            <h2>Phone Number: {amaanatUser?.PhoneNo}</h2>
            </div>
            {selectedItems.length > 0 && <button onClick={handleReturnItemsClicked}>{formOpen ? 'Cancel Returning' : 'Return Selected Items'}</button>}
            {formOpen && 
            <div>
                <h1>this is form</h1>
                <input value={returnedByName} onChange={(e) => setReturnedByName(e.target.value)} placeholder='Write your name' style={{ width: '300px'}}/>
                <button onClick={handleReturningItems}>Returned Selected Items</button>
            </div>}
            <DataTable 
                columns={amaanatColumns}
                data={amaanatItems}
                customStyles={tableStyles}
                onRowClicked={handleRowClicked}
                selectableRows
                selectableRowsHighlight
                onSelectedRowsChange={({selectedRows}) => setSelectedItems(selectedRows)}
                selectableRowDisabled={(row) => row.Returned === 1}
                clearSelectedRows={clearSelectedRows}
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
                            <p><b>Details:</b> {modalData.ItemDetails}</p>
                            <p><b>Date Received:</b> {formatDate(modalData.EntryDate)}</p>
                            <p><b>Location Stored:</b> {modalData.StoredLocation}</p>
                            <p><b>Returned:</b> {formatBoolean(modalData.Returned)}</p>
                            {modalData.ReturnedBy && <p><b>Returned By:</b> {modalData.ReturnedBy}</p>}
                            {modalData.ReturnedDate && <p><b>Returned Date:</b> {formatDate(modalData.ReturnedDate)}</p>}
                            <div className="modal-buttons">
                            </div>
                        </div>
                    }
                </Box>
            </Modal>
        </div>
    )
}