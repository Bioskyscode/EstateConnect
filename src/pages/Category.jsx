import { db } from "../firebase.config"
import {useParams} from 'react-router-dom'
import { collection, getDocs, query, where, orderBy, limit, startAfter} from "firebase/firestore"
import Spinner from "../components/Spinner"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import ListingItem from "../components/ListingItem"

function Category() {
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)
    const [lastFetchedListing, setLastFetchedListing] = useState()

    const params = useParams()

    useEffect(()=>{
        const fetchlistings = async ()=>{
            try {
                //Get reference
                const listngsRef = collection(db, "listings")

                //create a query
                const q = query(
                    listngsRef,
                    where("type", "==", params.categoryName),
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
                toast.error("Could not fetch listings")
            }
        }

        fetchlistings()
    },[params.categoryName])

    const onFetchMorelistings = async ()=>{
        try {
            //Get reference
            const listngsRef = collection(db, "listings")

            //create a query
            const q = query(
                listngsRef,
                where("type", "==", params.categoryName),
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
            <p className="pageHeader">{params.categoryName==="rent" ? "Placess for rent" : "Places for sale"}</p>
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
        : <p>No listings for {params.categoryName}</p>}
    </div>
  )
}

export default Category