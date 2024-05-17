import { useEffect, useState } from "react"
import Spinner from "./Spinner"
import { ReactComponent as ShareIcon } from '../assets/svg/shareIcon.svg'
import { Link, useNavigate, useParams } from "react-router-dom"
import { getAuth } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase.config"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { toast } from "react-toastify"


function Listing() {
    const [listing, setListing] = useState()
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)

    const navigate = useNavigate()
    const param = useParams()
    const auth = getAuth()

    useEffect(() => {
        const fetchlistings = async () => {
            try {
                const docRef = doc(db, "listings", param.listingId)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setListing(docSnap.data())
                    setLoading(false)
                }

            } catch (error) {
                toast.error("Firebase Daily Quota exceeded, please try again later to view the listing")

                    setTimeout(() => {
                        navigate("/sign-in")
                    }, 1000 * 30);
                
            }
        }

        fetchlistings()
    }, [param.listingId])

    if (loading) {
        return <Spinner />
    }

    return (
        <div className="pageContainer">

            <main>
                <Swiper
                    modules={[Navigation, Pagination, Scrollbar, A11y]}
                    spaceBetween={50}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    scrollbar={{ draggable: true }}
                >
                    {listing.imageUrls.map((url, index) => (
                        <SwiperSlide key={index}><img className="swiperSlideDiv" src={url} alt={listing.name} /></SwiperSlide>
                    ))}

                </Swiper>

                <div className="shareIconDiv"
                    onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        setShareLinkCopied(true)
                        setTimeout(() => {
                            setShareLinkCopied(false)
                        }, 2000);
                    }}
                >
                    <ShareIcon />
                </div>
                {shareLinkCopied && <p className="linkCopied">Link copied!</p>}
                <div className="listingDetails">
                    <p className="listingName">
                        {listing.name} -
                        ${listing.offer
                            ? listing.discountedPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                    </p>
                    <p className="listingLocation">{listing.address}</p>
                    <p className="listingType">For {listing.type === "rent" ? "Rent" : "Sale"}</p>
                    {listing.offer && (
                        <p className="discountPrice">$ {(listing.regularPrice - listing.discountedPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} discount</p>
                    )}
                    <ul className="listingDetailsList">
                        <li>
                            {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : "1 Bedroom"}
                        </li>
                        <li>
                            {listing.bathrooms > 1 ? `${listing.bathrooms} Bathrooms` : "1 Bathdroom"}
                        </li>
                        <li>
                            {listing.furnished && "Furnished"}
                        </li>
                        <li>
                            {listing.parking && "Parking Spot"}
                        </li>
                    </ul>
                    <p className='listingLocationTitle'>Location</p>
                    <div className="leafletContainer">
                        <MapContainer
                            style={{ height: "100%", width: "100%" }}
                            center={[listing.latitude, listing.longitude]}
                            zoom={13}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
                            />
                            <Marker position={[listing.latitude, listing.longitude]}>

                                <Popup>{listing.address}</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                    {auth.currentUser?.uid !== listing.userRef && (
                        <Link className="primaryButton"
                            to={`/contact/${listing.userRef}?listingName=${listing.name}`}
                        >
                            Contact Landlord
                        </Link>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Listing