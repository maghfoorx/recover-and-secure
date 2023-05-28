import useFetchUserAmaanatItems from '@/custom-hooks/useFetchUserAmaanatItems';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'

export default function AmaanatUserPage() {
    const { userId } = useParams();

    if(!userId) return null;

    const { amaanatItems, amaanatUser, handleGetAmaanatUser } = useFetchUserAmaanatItems({ ID: userId});

    useEffect(() => {
        handleGetAmaanatUser(userId);
    }, []);
    console.log(amaanatItems)
    return (
        <div>
            <Link to="/amaanat" className="go-back">Go Back</Link>
            <h1>{`Amaanat Items for ${amaanatUser?.Name}`}</h1>
            <Link to={`/amaanat/add-items/${userId}`}>Add Items</Link>
        </div>
    )
}