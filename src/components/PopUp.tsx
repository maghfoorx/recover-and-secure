import { LostItemType } from "@/data/Interfaces";
import "../styles/PopUp.css"

interface PopUpProps {
    popup: boolean;
    setPopup: React.Dispatch<React.SetStateAction<boolean>>;
    item: LostItemType | null
}

export default function PopUp(props: PopUpProps): JSX.Element {
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
                        <button onClick={() => props.setPopup(!props.popup)}>Close</button>
                        <button>Delete Item</button>
                    </div>
                </div>
            )}
        </div>
    )
}