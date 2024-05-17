import { useNavigate, useLocation } from "react-router-dom"
import {ReactComponent as OfferIcon} from '../assets/svg/localOfferIcon.svg'
import {ReactComponent as ExploreIcon} from '../assets/svg/exploreIcon.svg'
import {ReactComponent as PersonOutlineIcon} from '../assets/svg/personOutlineIcon.svg'

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const color = {active: "#0369a1", inactive: "#94a3b8"}
    const pathMatchRoute = (route)=>{
        if (route=== location.pathname) {
            return true
        }
    }
    const items = [
        {
            icon: <ExploreIcon fill={pathMatchRoute("/") ? color.active: color.inactive} width="29px" height="29px" />,
            text: "Explore",
            link: "/"
        },
        {
            icon: <OfferIcon fill={pathMatchRoute("/offers") ? color.active: color.inactive} width="29px" height="29px"/>,
            text: "Offers",
            link: "/offers"
        },
        {
            icon: <PersonOutlineIcon fill={pathMatchRoute("/profile") ? color.active: color.inactive} width="29px" height="29px"/>,
            text: "Profile",
            link: "/profile"
        },
    ];

    return (
        <footer className="navbar">
            <nav className="navbarNav">
                <ul className="navbarListItems">
                    {items.map((item, index) => (
                        <li onClick={()=> navigate(item.link)} key={index} className="navbarListItem">
                            {item.icon}
                            <p className={pathMatchRoute(item.link) ? "navbarListItemNameActive":"navbarListItemName"}>{item.text}</p>
                        </li>
                    ))}
                </ul>
            </nav>
        </footer>
    )
}

export default Navbar