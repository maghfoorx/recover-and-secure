import { NavLink } from "react-router-dom";
import "../styles/NavBar.css"

export default function NavBar(): JSX.Element {
    return (
        <div className="navbar">
            <NavLink to="/" className="navbar-item" >
                Lost Property
            </NavLink>
            <NavLink to="/amaanat" className="navbar-item">
                Amaanat
            </NavLink>
        </div>
    )
}