import { getUserAmaanatItems } from '@/IPC/IPCMessages.amaanat';
import UserInfoTile from '@/components/user-info-tile/UserInfoTile';
import useFetchAmaanatUsers from '@/customHooks/useFetchAmaanatUsers';
import useFetchUserAmaanatItems from '@/customHooks/useFetchUserAmaanatItems';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'

export default function AmaanatUserPage() {
    const { userId } = useParams();

    if(!userId) return null;

    const { amaanatItems, amaanatUser, handleGetAmaanatUser } = useFetchUserAmaanatItems({ ID: userId});

    useEffect(() => {
        handleGetAmaanatUser(userId);
    }, []);

    return (
        <div>
            <Link to="/amaanat" className="go-back">Go Back</Link>
            <h1>{`Amaanat Items for ${amaanatUser?.Name}`}</h1>
        </div>
    )
}