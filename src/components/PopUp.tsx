import { FoundItemType, LostItemType } from "@/data/Interfaces";
import { deleteLostItem, foundLostItem } from "@/data/IPC/IPCMessages";
import "../styles/PopUp.css";

interface PopUpProps {
    popup: boolean;
    setPopup: React.Dispatch<React.SetStateAction<boolean>>;
    item: LostItemType | null
}

export default function PopUp({ item, popup, setPopup }: PopUpProps): JSX.Element {

    async function handleDeleteItem(ID: number | undefined) {
        try {
            await deleteLostItem(ID);
            setPopup(!popup);
        }
        catch (error) {
            console.error(error)
        }
    }

    async function handleLostItemFound(ID: number | undefined) {
        try {
            await foundLostItem(ID);
            setPopup(!popup);
        }
        catch (error) {
            console.error(error)
        }
    }
    return (
        <div>
            {popup && item && (
                <div className="modal">
                    <div className="overlay" onClick={() => setPopup(!popup)}></div>
                    <div className="modal-content">
                        <h2>{item.ItemName}</h2>
                        <p>Details: {item.Details}</p>
                        <p>Lost Area: {item.LostArea}</p>
                        <p>Person: {item.PersonName}</p>
                        <p>Phone Number: {item.PhoneNumber}</p>
                        {item.ItemFound === "No" && <button onClick={() => handleLostItemFound(item.ID)}>Found</button>}
                    </div>
                </div>
            )}
        </div>
    )
}