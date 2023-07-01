import UserInfoTile from "@/components/user-info-tile/UserInfoTile";
import useFetchAmaanatUsers from "@/custom-hooks/useFetchAmaanatUsers";
import './amaanat-page.css'
import { Link } from 'react-router-dom'
import { useEffect, useState } from "react";
import { getAmaanatItems, getUserAmaanatItems } from "@/IPC/IPCMessages.amaanat";
import { AmaanatUserItemType, AmaanatUserType } from "@/type-definitions/types.amaanat";
import { filterByStoredItems } from "@/utils/filterByStoredItems";

type AmaanatPageProperties = {
    computerName: string;
}

export default function AmaanatPage({ computerName }: AmaanatPageProperties): JSX.Element {

    const { amaanatUsers } = useFetchAmaanatUsers();

    const [searchBarValue, setSearchBarValue] = useState<string>('');
    const [amanatItems, setAmaanatItems] = useState<AmaanatUserItemType[]>([]);
    const [isFilteredByStored, setIsFilterByStored] = useState(false)

    async function handleGetAmaanatItems() {
        const response = await getAmaanatItems()
        setAmaanatItems(response)
    };

    useEffect(() => {
        handleGetAmaanatItems();
    }, []);

    const filteredOnStoredItems = filterByStoredItems(amaanatUsers, amanatItems)
    const usersToShow = isFilteredByStored ? filteredOnStoredItems : amaanatUsers

    const filteredItems = usersToShow.filter(item => item.AIMSNo.toLocaleLowerCase().includes(searchBarValue.toLocaleLowerCase()) || item.Name.toLocaleLowerCase().includes(searchBarValue.toLocaleLowerCase()))

    return (
        <div className="amaanat-page">
            <div className="amaanat-page-navbar">
                {!computerName && <p style={{ color: 'red', fontWeight: 'bold'}}>☝️☝️PLEASE NAME YOUR COMPUTER TOP LEFT OF SCREEN☝️☝️</p>}
            <Link to="/amaanat/sign-up" className="link-sign-up">Sign Up User</Link>
            <input value={searchBarValue} onChange={(event) => setSearchBarValue(event.target.value)} placeholder="Search Person Name or AIMS ID"/>
            <label>
                <input
                type="checkbox"
                checked={isFilteredByStored}
                onChange={() => setIsFilterByStored(!isFilteredByStored)}
                />
                <span>Show users with only items stored.</span>
                </label>
            </div>
            <div className="amaanat-users">
                {amaanatUsers.length < 1 && <p>No Amanat users added yet!</p>}
                {amaanatUsers.length >= 1 && filteredItems.length < 1 && <p>No users match this search!</p>}
                {filteredItems.map((user) => {
                    const itemsStored = amanatItems
                                            .filter(item => item.UserID === user.ID)
                                            .filter(item => item.Returned === 0).length
                    const itemsReturned = amanatItems
                    .filter(item => item.UserID === user.ID)
                    .filter(item => item.Returned === 1).length
                    return (
                        <UserInfoTile {...user} key={user.ID} itemsData={{storedNumber: itemsStored, returnedNumber: itemsReturned}}/>
                    )
                })}
            </div>
        </div>
    )
}