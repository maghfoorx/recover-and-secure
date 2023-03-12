import useFetchLostItems from "@/customHooks/useFetchLostItems";
import { LostItemType } from "@/data/Interfaces";
import { useEffect, useState } from "react";
import DataGrid from "react-data-grid";
import 'react-data-grid/lib/styles.css';
import { Link } from "react-router-dom";
import PopUp from "./PopUp";
import "../styles/LostItems.css"

export default function LostItems(): JSX.Element {

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
            key: "ItemName", name: "Name", width: 100,
            formatter: ({ row }: any) => (
                <div onClick={() => {
                    setPopUpData(row)
                    setPopup(!popup)
                }} style={{ cursor: "pointer" }}>{row.ItemName}</div>
            )
        },
        {
            key: "Details", name: "Details",
            formatter: ({ row }: any) => (
                <div onClick={() => {
                    setPopUpData(row)
                    setPopup(!popup)
                }} style={{ cursor: "pointer" }}>{row.Details}</div>
            )
        },
        { key: "LostArea", name: "Lost Area", width: 100 },
        { key: "Date", name: "Date Lost", width: 90 },
        { key: "ItemFound", name: "Found", width: 90 }
    ]

    return (
        <div className="lost-items-component">
            <Link to="/lost-item-form">Report Lost Item</Link>
            <h2>Reported Lost Items</h2>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <DataGrid columns={columns} rows={lostItems} rowKeyGetter={(row: LostItemType) => row.ID} rowHeight={45} style={{ width: "100vw" }} className="fill-grid" />
            </div>
            <p>Total Lost Items: {lostItems.length}</p>
            <p>Total Found Items: {lostItems.filter(item => item.ItemFound === "Yes").length}</p>
            <PopUp popup={popup} setPopup={setPopup} item={PopUpData} />
        </div>
    )
}