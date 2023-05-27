import { AmaanatUserType } from "@/type-definitions/types.amaanat";

export default function UserInfoTile({
    ID,
    Name,
    AIMSNo,
    PhoneNo
}: AmaanatUserType) {
    return(
        <h2>{Name}</h2>
    )
}