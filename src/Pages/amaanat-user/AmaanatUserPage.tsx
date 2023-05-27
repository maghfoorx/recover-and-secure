import { getUserAmaanatItems } from '@/IPC/IPCMessages.amaanat';
import useFetchUserAmaanatItems from '@/customHooks/useFetchUserAmaanatItems';
import { Link, useParams } from 'react-router-dom'

export default function AmaanatUserPage() {
    const { userId } = useParams();

    if(!userId) return null;

    const { amaanatItems } = useFetchUserAmaanatItems({ ID: userId})

    console.log(amaanatItems, userId, 'is the user ID and items')
    return (
        <div>
            <Link to="/amaanat" className="go-back">Go Back</Link>
            <h1>{`Amaanat Items for ${userId}`}</h1>
            <h1>ID: {userId}</h1>
        </div>
    )
}