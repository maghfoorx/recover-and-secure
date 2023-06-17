import UserInfoTile from "@/components/user-info-tile/UserInfoTile";
import useFetchAmaanatUsers from "@/custom-hooks/useFetchAmaanatUsers";
import './amaanat-page.css'
import { Link } from 'react-router-dom'
import { useState } from "react";
import { printAmaanatReceipt } from "@/IPC/IPCMessages.amaanat";

export default function AmaanatPage(): JSX.Element {

    const { amaanatUsers } = useFetchAmaanatUsers();

    const [searchBarValue, setSearchBarValue] = useState<string>('');

    const filteredItems = amaanatUsers.filter(item => item.AIMSNo.toLocaleLowerCase().includes(searchBarValue.toLocaleLowerCase()) || item.Name.toLocaleLowerCase().includes(searchBarValue.toLocaleLowerCase()))

    return (
        <div className="amaanat-page">
            <div className="amaanat-page-navbar">
            <Link to="/amaanat/sign-up" className="link-sign-up">Sign Up User</Link>
            <input value={searchBarValue} onChange={(event) => setSearchBarValue(event.target.value)} placeholder="Search Person Name or AIMS ID"/>
            </div>
            <div className="amaanat-users">
                {filteredItems.map((user) => {
                    return (
                        <UserInfoTile {...user} key={user.ID}/>
                    )
                })}
            </div>
        </div>
    )
}