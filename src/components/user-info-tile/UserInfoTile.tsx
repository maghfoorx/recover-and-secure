import { AmaanatUserType } from "@/type-definitions/types.amaanat";
import './user-info-tile.css'
import { useNavigate } from "react-router-dom";

export default function UserInfoTile({
    ID,
    Name,
    AIMSNo,
    PhoneNo
}: AmaanatUserType) {
    const navigate = useNavigate();

    function handleUserClick() {
        navigate(`/amaanat/${ID}`)
    }
    return(
        <div className="user-info-tile" onClick={handleUserClick}>
        <h2>{Name}</h2>
        <p>{AIMSNo}</p>
        </div>
    )
}