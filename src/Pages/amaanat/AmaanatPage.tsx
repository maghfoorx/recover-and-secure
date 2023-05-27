import UserInfoTile from "@/components/user-info-tile/UserInfoTile";
import useFetchAmaanatUsers from "@/custom-hooks/useFetchAmaanatUsers";
import './amaanat-page.css'
import { Link, useNavigate } from 'react-router-dom'

export default function AmaanatPage(): JSX.Element {

    const { amaanatUsers } = useFetchAmaanatUsers();

    const navigate = useNavigate();

    return (
        <div>
            <h1>This is Amaanat Page</h1>
            <Link to="/amaanat/sign-up" >Sign Up User</Link>
            <div className="amaanat-users">
                {amaanatUsers.map((user) => {
                    return (
                        <UserInfoTile {...user} key={user.ID}/>
                    )
                })}
            </div>
        </div>
    )
}