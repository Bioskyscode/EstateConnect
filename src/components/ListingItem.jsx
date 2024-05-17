import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg'
import { ReactComponent as EditIcon } from '../assets/svg/editIcon.svg'
import bedIcon from '../assets/svg/bedIcon.svg'
import bathtubIcon from '../assets/svg/bathtubIcon.svg'
import { Link } from 'react-router-dom'


function ListingItem({ listing, id, onEdit, onDelete }) {
    return (
        <div className='categoryListing'>
            <Link to={`/category/${listing.type}/${id}`} className='categoryListingLink' >
                <img className='categoryListingImg' src={listing.imageUrls[0]} alt={listing.name} />
                <div className='categoryListingDetails'>
                    <p className='categoryListingLocation'>{listing.address ? listing.address : listing.location}</p>
                    <p className='categoryListingName'>{listing.name}</p>
                    <p className='categoryListingPrice'>${listing.offer
                        ? listing.discountedPrice
                            .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        : listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        {listing.type === "rent" && " / Month"}
                    </p>
                    <div className='categoryListingInfoDiv'>
                        <div className='room'>
                            <img src={bedIcon} alt="bed" />
                            <p className='categoryListingInfoText'>
                                {listing.bedrooms > 1 ? `${listing.bedrooms} Bedrooms` : "1 Bedroom"}
                            </p>
                        </div>

                        <div className='room'>
                            <img src={bathtubIcon} alt="bed" />
                            <p className='categoryListingInfoText'>
                                {listing.bathrooms > 1 ? `${listing.bathrooms} bathrooms` : "1 bathroom"}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>

            {onDelete && <DeleteIcon
                className='removeIcon'
                fill='rgb(231, 76, 60)'
                onClick={() => onDelete(listing.id, listing.name)}
            />}

            {onEdit && <EditIcon
                className='editIcon'
                onClick={() => onEdit(id)}
            />}
        </div>
    )
}

export default ListingItem