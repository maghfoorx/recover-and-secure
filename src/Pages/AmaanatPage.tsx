import UserInfoTile from "@/components/user-info-tile/UserInfoTile";
import useFetchAmaanatData from "@/customHooks/useFetchAmaanatData"

export default function AmaanatPage(): JSX.Element {
    const { amaanatUsers } = useFetchAmaanatData();

    console.log(amaanatUsers)
    return (
        <div>
            <h1>This is Amaanat Page</h1>
            <button>Sign Up User</button>
            <div>
                {amaanatUsers.map((user) => {
                    return (
                        <UserInfoTile {...user} key={user.ID}/>
                    )
                })}
            </div>
        </div>
    )
}