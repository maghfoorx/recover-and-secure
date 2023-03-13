import useFetchLostPropertyData from "@/customHooks/useFetchLostPropertyData";
import { FoundItemType } from "@/data/Interfaces";
import { useState } from "react";
import DataGrid from "react-data-grid";
import "../styles/FoundItems.css";
import PopUp from "./PopUp";

export default function FoundItems(): JSX.Element {

    const [popup, setPopup] = useState<boolean>(false);
    const [popupData, setPopUpData] = useState<FoundItemType | null>(null)

    const { foundItems } = useFetchLostPropertyData();

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
        { key: "FoundArea", name: "Found Area", width: 100 },
        { key: "FoundDate", name: "Date Found", width: 90 },
        { key: "Returned", name: "Returned", width: 90 }
    ]

    return (
        <div className="found-items-component">
            <h1>This is Found Items Component</h1>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <DataGrid columns={columns} rows={foundItems} rowKeyGetter={(row: FoundItemType) => row.ID} rowHeight={45} style={{ width: "100vw" }} className="fill-grid" />
                <PopUp item={popupData} popup={popup} setPopup={setPopup} />
            </div>
        </div>
    )
}