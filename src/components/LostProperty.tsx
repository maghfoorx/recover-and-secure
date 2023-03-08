import useFetchLostItems from "@/customHooks/useFetchLostItems";
import { LostItemType } from "@/data/Interfaces";
import { useEffect, useState } from "react";
import DataGrid from "react-data-grid";
import 'react-data-grid/lib/styles.css';
import { Link } from "react-router-dom";
import PopUp from "./PopUp";
import TableLostItems from "./TableLostItems";
import MaterialTable from "material-table";
import { ThemeProvider, createTheme } from "@mui/material";

export default function LostProperty(): JSX.Element {

    //Popupstate declaration

    const [popup, setPopup] = useState<boolean>(false);
    const [PopUpData, setPopUpData] = useState<null | LostItemType>(null)

    const { lostItems, handleGetLostItems } = useFetchLostItems();

    useEffect(() => {
        handleGetLostItems();
    }, [popup])

    //creating columns
    const columns = [
        { key: "ID", name: "ID", width: 10 },
        {
            key: "ItemName", name: "Name", width: 20,
            formatter: ({ row }: any) => (
                <div onClick={() => {
                    setPopUpData(row)
                    setPopup(!popup)
                }} style={{ cursor: "pointer" }}>{row.ItemName}</div>
            )
        },
        { key: "Details", name: "Details" },
        { key: "LostArea", name: "Lost Area", width: 100 },
        { key: "Date", name: "Date Lost", width: 90 },
        { key: "ItemFound", name: "Found", width: 90 }
    ]

    return (
        <>
            <h1>This is Lost Property Page</h1>
            <Link to="/lost-item-form">Report Lost Item</Link>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <DataGrid columns={columns} rows={lostItems} rowKeyGetter={(row: LostItemType) => row.ID} rowHeight={45} style={{ height: "100vh", width: "90vw" }} />
            </div>
            <PopUp popup={popup} setPopup={setPopup} item={PopUpData} />
        </>
    )
}