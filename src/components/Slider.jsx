import { useEffect, useState } from "react"
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Spinner from "./Spinner";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";


function Slider() {
    const [loading, setLoading] = useState(true)
    const [listings, setListings] = useState()

    const navigate = useNavigate()

    useEffect(() => {
        const fetchlistings = async () => {
            try {
                const listingsRef = collection(db, "listings")
                const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5))

                const querySnap = await getDocs(q)

                const listings = []

                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                })
                setListings(listings)
                setLoading(false)

            } catch (error) {
                toast.error("Firebase Daily Quota exceeded, please try again later to view the recommended listings")
                setTimeout(() => {
                    navigate("/sign-in")
                }, 1000 * 30);
            }
        }
        fetchlistings()
    }, [])

    if (loading) {
        return <Spinner />
    }

    if (listings.length === 0) {
        return <></>
    }

    return (
        <>
            {/* <p className="exploreHeading">Recommended</p> */}
            <Swiper
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                // spaceBetween={50}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                scrollbar={{ draggable: true }}
            >
                {listings.map(({ data, id }) => (
                    <SwiperSlide key={id} onClick={() => navigate(`/category/${data.type}/${id}`)}>
                        <img className="swiperSlideDiv" src={data.imageUrls} alt={data.name} />
                        <p className="swiperSlideText">{data.name}</p>
                        <p className="swiperSlidePrice">${data.discountedPrice ?? data.regularPrice} {data.type === "rent" && "/ Month"}</p>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    )
}

export default Slider