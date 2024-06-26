
import { useEffect, useRef, useState } from "react"
import Spinner from "../components/Spinner"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db } from "../firebase.config"
import { v4 as uuidv4 } from 'uuid'
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore"

function EditListing() {
    // const [geolocationEnabled, setGeolocationEnabled] = useState(true)
    const [listing, setListing] = useState()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: "rent",
        name: "",
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: "",
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: {},
        latitude: 0,
        longitude: 0
    })

    const {
        type,
        name,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        address,
        offer,
        regularPrice,
        discountedPrice,
        images,
        latitude,
        longitude,
    } = formData

    const auth = getAuth()
    const navigate = useNavigate()
    const params = useParams()
    const isMounted = useRef()

    //Redirect if listing is not user's
    useEffect(()=>{
        if (listing && listing.userRef !== auth.currentUser.uid) {
            toast.error("You can not edit that listing")
            navigate("/")
        } 
    })
    // Fetch listing to edit
    useEffect(()=>{
        setLoading(true)
    const fetchlisting = async ()=>{
        const docRef = doc(db, "listings",params.listingId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            setListing(docSnap.data())
            setFormData({...docSnap.data()})
            setLoading(false)
        } else {
            navigate("/")
        }
    }
    fetchlisting()
    }, [navigate, params.listingId])

    // Sets userRef to  logged in user
    useEffect(() => {
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData({ ...formData, userRef: user.uid })
                } else {
                    navigate('/sign-in')
                    toast.error("Listing does not exist")
                }
            })
        }

        return () => {
            isMounted.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted])

    const onSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)
        if (discountedPrice > regularPrice) {
            setLoading(false)
            
            return toast.error("Discounted price has to be lowered than regular price"), toast.clearWaitingQueue()
        }
        if (images.length > 6) {
            setLoading(false)
            
            return toast.error("Max of six images"),  toast.clearWaitingQueue()
        }

        // Store images in firebase
        const storeImg = async (image) => {
            return new Promise((resolve, reject) => {
                const storage = getStorage()
                const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`
                const storageRef = ref(storage, "images/" + fileName)

                const uploadTask = uploadBytesResumable(storageRef, image)

                uploadTask.on('state_changed',
                    (snapshot) => {
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                            default:
                                break
                        }
                    },
                    (error) => {
                    
                        reject(error)
                    },
                    () => {
                        // Upload completed successfully, now we can get the download URL
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                );
            })
        }

        const imageUrls = await Promise.all(
            [...images].map(image => storeImg(image))

        ).catch(() => {
            setLoading(false)
            toast.error("Images not uploaded")
            return
        })

        const formDataCopy = {
            ...formData,
            imageUrls,
            timestamp: serverTimestamp()
        }

        delete formDataCopy.images
        !formDataCopy.offer && delete formDataCopy.discountedPrice

        // Update listing
        const docRef = doc(db, "listings", params.listingId)
        await updateDoc(docRef, formDataCopy)
        setLoading(false)
        toast.success("Listing saved")
        navigate(`/category/${formDataCopy.type}/${docRef.id}`)
    }

    const onMutate = (e) => {
        let boolean = null
        if (e.target.value === "true") {
            boolean = true
        }

        if (e.target.value === "false") {
            boolean = false
        }

        //Files
        if (e.target.files) {
            setFormData(prevState => ({
                ...prevState,
                images: e.target.files
            }))
        }

        //Text/Booleans/Numbers
        if (!e.target.files) {
            setFormData(prevState => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value
            }))
        }
    }

    if (loading) {
        return <Spinner />
    }

    return (
        <div className="pageContainer">
            <div className="profile">
                <header className="pageHeader">Edit a Listing</header>
                <main>
                    <form onSubmit={onSubmit}>
                        <label className="formLabel">Sell / Rent</label>
                        <div className="formButtons">
                            <button
                                type="button"
                                className={type === "sale" ? "formButtonActive" : "formButton"}
                                id="type"
                                value="sale"
                                onClick={onMutate}
                            >
                                Sell
                            </button>

                            <button
                                type="button"
                                className={type === "rent" ? "formButtonActive" : "formButton"}
                                id="type"
                                value="rent"
                                onClick={onMutate}
                            >
                                Rent
                            </button>
                        </div>

                        <label className='formLabel'>Name</label>
                        <input
                            className='formInputName'
                            type='text'
                            id='name'
                            value={name}
                            onChange={onMutate}
                            maxLength='32'
                            minLength='10'

                        />

                        <div className='formRooms flex'>
                            <div>
                                <label className='formLabel'>Bedrooms</label>
                                <input
                                    className='formInputSmall'
                                    type='number'
                                    id='bedrooms'
                                    value={bedrooms}
                                    onChange={onMutate}
                                    min='1'
                                    max='50'

                                />
                            </div>
                            <div>
                                <label className='formLabel'>Bathrooms</label>
                                <input
                                    className='formInputSmall'
                                    type='number'
                                    id='bathrooms'
                                    value={bathrooms}
                                    onChange={onMutate}
                                    min='1'
                                    max='50'

                                />
                            </div>
                        </div>

                        <label className='formLabel'>Parking spot</label>
                        <div className='formButtons'>
                            <button
                                className={parking ? 'formButtonActive' : 'formButton'}
                                type='button'
                                id='parking'
                                value={true}
                                onClick={onMutate}
                                min='1'
                                max='50'
                            >
                                Yes
                            </button>
                            <button
                                className={
                                    !parking && parking !== null ? 'formButtonActive' : 'formButton'
                                }
                                type='button'
                                id='parking'
                                value={false}
                                onClick={onMutate}
                            >
                                No
                            </button>
                        </div>

                        <label className='formLabel'>Furnished</label>
                        <div className='formButtons'>
                            <button
                                className={furnished ? 'formButtonActive' : 'formButton'}
                                type='button'
                                id='furnished'
                                value={true}
                                onClick={onMutate}
                            >
                                Yes
                            </button>
                            <button
                                className={
                                    !furnished && furnished !== null
                                        ? 'formButtonActive'
                                        : 'formButton'
                                }
                                type='button'
                                id='furnished'
                                value={false}
                                onClick={onMutate}
                            >
                                No
                            </button>
                        </div>

                        <label className='formLabel'>Address</label>
                        <textarea
                            className='formInputAddress'
                            type='text'
                            id='address'
                            value={address}
                            onChange={onMutate}

                        />

                        {
                            <div className='formLatLng flex'>
                                <div>
                                    <label className='formLabel'>Latitude</label>
                                    <input
                                        className='formInputSmall'
                                        type='number'
                                        id='latitude'
                                        value={latitude}
                                        onChange={onMutate}

                                    />
                                </div>
                                <div>
                                    <label className='formLabel'>Longitude</label>
                                    <input
                                        className='formInputSmall'
                                        type='number'
                                        id='longitude'
                                        value={longitude}
                                        onChange={onMutate}

                                    />
                                </div>
                            </div>
                        }

                        <label className='formLabel'>Offer</label>
                        <div className='formButtons'>
                            <button
                                className={offer ? 'formButtonActive' : 'formButton'}
                                type='button'
                                id='offer'
                                value={true}
                                onClick={onMutate}
                            >
                                Yes
                            </button>
                            <button
                                className={
                                    !offer && offer !== null ? 'formButtonActive' : 'formButton'
                                }
                                type='button'
                                id='offer'
                                value={false}
                                onClick={onMutate}
                            >
                                No
                            </button>
                        </div>

                        <label className='formLabel'>Regular Price</label>
                        <div className='formPriceDiv'>
                            <input
                                className='formInputSmall'
                                type='number'
                                id='regularPrice'
                                value={regularPrice}
                                onChange={onMutate}
                                min='50'
                                max='750000000'

                            />
                            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
                        </div>

                        {offer && (
                            <>
                                <label className='formLabel'>Discounted Price</label>
                                <input
                                    className='formInputSmall'
                                    type='number'
                                    id='discountedPrice'
                                    value={discountedPrice}
                                    onChange={onMutate}
                                    min='50'
                                    max='750000000'
                                    required={offer}
                                />
                            </>
                        )}

                        <label className='formLabel'>Images</label>
                        <p className='imagesInfo'>
                            The first image will be the cover (max 6).
                        </p>
                        <input
                            className='formInputFile'
                            type='file'
                            id='images'
                            onChange={onMutate}
                            max='6'
                            accept='.jpg,.png,.jpeg'
                            multiple
                            required
                        />
                        <button type='submit' className='primaryButton createListingButton'>
                            Edit Listing
                        </button>

                    </form>
                </main>
            </div>
        </div>
    )
}

export default EditListing