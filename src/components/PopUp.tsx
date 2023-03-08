import useFetchLostItems from "@/customHooks/useFetchLostItems";
import { LostItemType } from "@/data/Interfaces";
import { deleteLostItem } from "@/data/IPC/IPCMessages";
import "../styles/PopUp.css";

interface PopUpProps {
    popup: boolean;
    setPopup: React.Dispatch<React.SetStateAction<boolean>>;
    item: LostItemType | null
}

export default function PopUp(props: PopUpProps): JSX.Element {

    const { handleGetLostItems } = useFetchLostItems();

    async function handleDeleteItem(ID: number | undefined) {
        try {
            await deleteLostItem(ID);
            props.setPopup(!props.popup);
        }
        catch (error) {
            console.error(error)
        }
    }
    return (
        <div>
            {props.popup && (
                <div className="modal">
                    <div className="overlay" onClick={() => props.setPopup(!props.popup)}></div>
                    <div className="modal-content">
                        <h2>{props.item?.ItemName}</h2>
                        <p>Details: {props.item?.Details}</p>
                        <p>Lost Area: {props.item?.LostArea}</p>
                        <p>Person: {props.item?.PersonName}</p>
                        <p>Phone Number: {props.item?.PhoneNumber}</p>
                        <button onClick={() => props.setPopup(!props.popup)} className="close-modal">Close</button>
                        <button onClick={() => handleDeleteItem(props.item?.ID)}>Delete Item</button>
                    </div>
                </div>
            )}
        </div>
    )
}