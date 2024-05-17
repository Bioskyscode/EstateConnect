import { getAuth, updateProfile } from "firebase/auth";
import { updateDoc, doc, collection, query, where, orderBy, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg'
import { ReactComponent as HomeIcon } from '../assets/svg/homeIcon.svg'
import ListingItem from "../components/ListingItem";

function Profile() {
    const auth = getAuth()
    const navigate = useNavigate()
    const [changeDetails, setChangeDetails] = useState(false)
    const [listings, setListings] = useState()
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email
    })

    const { name, email } = formData

    useEffect(() => {

        const fetchlistings = async () => {
            try {
                const listingsRef = collection(db, "listings")
                const q = query(listingsRef, where("userRef", "==", auth.currentUser.uid), orderBy("timestamp", "desc"))

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
            }


            catch (error) {
                // <div>Firebase Daily Quota exceeded, please try again later</div>
                toast.error("Firebase Daily Quota exceeded, please try again later to see your listings")

                if (navigate("/profile")) {
                    setTimeout(() => {
                        navigate("/sign-in")
                    }, 1000 * 30);
                }
            }
        }
        fetchlistings()
    }, [auth.currentUser.uid, navigate])

    const onLoggout = () => {
        auth.signOut()
        navigate("/sign-in")
    }
    const onSubmit = async () => {
        try {
            if (auth.currentUser.displayName !== name) {
                //update displayed name in fb
                await updateProfile(auth.currentUser, {
                    displayName: name,
                })
                // update in firestore
                const userRef = doc(db, "users", auth.currentUser.uid)
                await updateDoc(userRef, { name })
                toast.success("Successful!")
            }

        } catch (error) {
            toast.error("Could not update profile details")
        }
    }

    const onChange = (e) => {
        setFormData(prevState => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }

    const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)

    const onDelete = async (listingId) => {
        try {
            if (window.confirm("Are you sure you want to delete?")) {
                await deleteDoc(doc(db, "listings", listingId))
                const updatedListings = listings.filter(
                    (listing) => listing.id !== listingId)
                setListings(updatedListings)
                toast.success("Successfully deleted")
            }

        } catch (error) {
            toast.error("Unable to delete listing")
        }
    }

    // if (loading) {
    //     return <Spinner />
    // }

    return (
        <div className="pageContainer">
            <div className="profile">
                <header className="profileHeader">
                    <p className="pageHeader">My Profile</p>
                    <button type="button" className="logOut" onClick={onLoggout}>Logout</button>
                </header>
                <main>
                    <div className="profileDetailsHeader">
                        <p className="profileDetailsText">Personal Details</p>
                        <p className="changePersonalDetails" onClick={() => {
                            changeDetails && onSubmit()
                            setChangeDetails(!changeDetails)
                        }}>
                            {changeDetails ? "done" : "change"}
                        </p>
                    </div>
                    <div className="profileCard">
                        <form>
                            <input
                                type="text"
                                id="name"
                                className={!changeDetails ? "profileName" : "profileNameActive"}
                                value={name}
                                disabled={!changeDetails}
                                onChange={onChange}
                            />

                            <input
                                type="text"
                                id="email"
                                className="profileEmail"
                                value={email}
                                disabled={!changeDetails}
                            // onChange={onChange}
                            />
                        </form>
                    </div>
                    <Link to="/create-listing" className="createListing">
                        {<HomeIcon fill="#627da1" />}
                        <p>Sell or rent your home</p>
                        {<ArrowRightIcon fill="#0369a1" />}
                    </Link>

                    {!loading && listings.length > 0 && (
                        <>
                            <p className="listingText">Your Listings</p>
                            <ul className="listingsList">
                                {listings.map(listing => (
                                    <ListingItem
                                        key={listing.id}
                                        listing={listing.data}
                                        id={listing.id}
                                        onDelete={() => onDelete(listing.id)}
                                        onEdit={() => onEdit(listing.id)}
                                    />
                                ))}
                            </ul>
                        </>
                    )}
                </main>
            </div>

        </div>
    )
}

export default Profile