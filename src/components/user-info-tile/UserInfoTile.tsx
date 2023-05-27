import { AmaanatUserType } from "@/type-definitions/types.amaanat";
import './user-info-tile.css'

export default function UserInfoTile({
    ID,
    Name,
    AIMSNo,
    PhoneNo
}: AmaanatUserType) {
    return(
        <div className="user-info-tile">
        <h2>{Name}</h2>
        <p>{AIMSNo}</p>
        </div>
    )
}