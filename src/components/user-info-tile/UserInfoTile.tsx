import { AmaanatUserType } from "@/type-definitions/types.amaanat";
import './user-info-tile.css'
import { useNavigate } from "react-router-dom";

export default function UserInfoTile({
    ID,
    Name,
    AIMSNo,
    PhoneNo,
    itemsData
}: AmaanatUserType) {
    const navigate = useNavigate();

    function handleUserClick() {
        navigate(`/amaanat/${ID}`)
    }

    const storedClassName = itemsData.storedNumber > 0 ? '' : 'none-stored'
    return(
        <div className={`user-info-tile ${storedClassName}`} onClick={handleUserClick}>
        <p>{Name}</p>
        <p><b>{AIMSNo}</b></p>
        {itemsData && <p>{itemsData.storedNumber} stored</p>}
        {itemsData && <p>{itemsData.returnedNumber} returned</p>}
        </div>
    )
}