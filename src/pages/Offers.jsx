import { db } from "../firebase.config"
import { collection, getDocs, query, where, orderBy, limit, startAfter } from "firebase/firestore"
import Spinner from "../components/Spinner"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import ListingItem from "../components/ListingItem"
import { useNavigate } from "react-router-dom"

function Offers() {
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastFetchedListing, setLastFetchedListing] = useState()

    const navigate = useNavigate()
    // const params = useParams()

    useEffect(() => {
        const fetchlistings = async () => {
            try {
                //Get reference
                const listngsRef = collection(db, "listings")

                //create a query
                const q = query(
                    listngsRef,
                    where("offer", "==", true),
                    orderBy("timestamp", "desc"),
                    limit(2)
                )

                //Execute query
                const querySnap = await getDocs(q)
                const lastvisible = querySnap.docs[querySnap.docs.length - 1]
                setLastFetchedListing(lastvisible)

                const listings = []

                querySnap.forEach(doc => {
                    listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                });

                setListings(listings)
                setLoading(false)

            } catch (error) {
                toast.error("Firebase Daily Quota exceeded, please try again later")
                setTimeout(() => {
                    navigate("/sign-in")
                }, 1000 * 30);
            }
        }

        fetchlistings()
    }, [navigate])

    const onFetchMorelistings = async () => {
        try {
            //Get reference
            const listngsRef = collection(db, "listings")

            //create a query
            const q = query(
                listngsRef,
                where("offer", "==", true),
                orderBy("timestamp", "desc"),
                startAfter(lastFetchedListing),
                limit(10)
            )

            //Execute query
            const querySnap = await getDocs(q)
            const lastvisible = querySnap.docs[querySnap.docs.length - 1]
            setLastFetchedListing(lastvisible)
            const listings = []

            querySnap.forEach(doc => {
                listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            });

            setListings(prvevState => [...prvevState, ...listings])
            setLoading(false)
        } catch (error) {
            toast.error("Could not fetch listings")
        }
    }

    return (
        <div className="category">
            <header>
                <p className="pageHeader">Offers</p>
            </header>
            {loading ? <Spinner /> : listings.length > 0 ?
                <>
                    <main>
                        <ul className="categoryListings">
                            {listings.map(listing => (
                                <ListingItem
                                    key={listing.id}
                                    listing={listing.data}
                                    id={listing.id}
                                />
                            ))}
                        </ul>
                    </main>
                    <br />
                    {lastFetchedListing && <p className="loadMore" onClick={onFetchMorelistings}>Load More</p>}
                </>
                : <p>There are no current offers</p>}
        </div>
    )
}

export default Offers