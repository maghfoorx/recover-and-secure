import { FoundItemType, LostItemType } from "@/data/Interfaces";
import { deleteLostItem, foundLostItem } from "@/data/IPC/IPCMessages";
import "../styles/PopUp.css";

type PopUpItemType = LostItemType | null | FoundItemType

interface PopUpProps {
    popup: boolean;
    setPopup: React.Dispatch<React.SetStateAction<boolean>>;
    item: PopUpItemType
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

    function isLostItem(item: PopUpItemType) {
        if (item) {
            return "Found" in item && "ItemFound" in item
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
                        {isLostItem(item) && <p>Lost Area: {item.LostArea}</p>}
                        {isLostItem(item) && <p>Person: {item.PersonName}</p>}
                        {isLostItem(item) && <p>Phone Number: {item.PhoneNumber}</p>}
                        <button onClick={() => setPopup(!popup)} className="close-modal">Close</button>
                        <button onClick={() => handleDeleteItem(item.ID)}>Delete Item</button>
                        {isLostItem(item) && item.ItemFound === "No" && <button onClick={() => handleLostItemFound(item.ID)}>Found</button>}
                    </div>
                </div>
            )}
        </div>
    )
}