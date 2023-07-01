import UserInfoTile from "@/components/user-info-tile/UserInfoTile";
import useFetchAmaanatUsers from "@/custom-hooks/useFetchAmaanatUsers";
import './amaanat-page.css'
import { Link } from 'react-router-dom'
import { useState } from "react";

type AmaanatPageProperties = {
    computerName: string;
}

export default function AmaanatPage({ computerName }: AmaanatPageProperties): JSX.Element {

    console.log(computerName, 'is the name of the computer')

    const { amaanatUsers } = useFetchAmaanatUsers();

    const [searchBarValue, setSearchBarValue] = useState<string>('');

    const filteredItems = amaanatUsers.filter(item => item.AIMSNo.toLocaleLowerCase().includes(searchBarValue.toLocaleLowerCase()) || item.Name.toLocaleLowerCase().includes(searchBarValue.toLocaleLowerCase()))

    return (
        <div className="amaanat-page">
            <div className="amaanat-page-navbar">
                {!computerName && <p style={{ color: 'red', fontWeight: 'bold'}}>☝️☝️PLEASE NAME YOUR COMPUTER TOP LEFT OF SCREEN☝️☝️</p>}
            <Link to="/amaanat/sign-up" className="link-sign-up">Sign Up User</Link>
            <input value={searchBarValue} onChange={(event) => setSearchBarValue(event.target.value)} placeholder="Search Person Name or AIMS ID"/>
            </div>
            <div className="amaanat-users">
                {amaanatUsers.length < 1 && <p>No Amanat users added yet!</p>}
                {amaanatUsers.length >= 1 && filteredItems.length < 1 && <p>No users match this search!</p>}
                {filteredItems.map((user) => {
                    return (
                        <UserInfoTile {...user} key={user.ID}/>
                    )
                })}
            </div>
        </div>
    )
}