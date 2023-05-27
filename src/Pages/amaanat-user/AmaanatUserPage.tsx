import { Link, useParams } from 'react-router-dom'

export default function AmaanatUserPage() {
    const { userId } = useParams();
    return (
        <div>
            <Link to="/amaanat" className="go-back">Go Back</Link>
            <h1>This is Amaanat User Page</h1>
            <h1>ID: {userId}</h1>
        </div>
    )
}