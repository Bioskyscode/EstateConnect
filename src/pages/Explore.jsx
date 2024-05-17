import { Link } from 'react-router-dom'
import rentcategoryImg from '../assets/jpg/rentCategoryImage.jpg'
import sellCategoryImg from '../assets/jpg/sellCategoryImage.jpg'
import Slider from '../components/Slider'

function Explore() {
  return (
    <div className='pageContainer exploreContainer'>
      <div className='explore'>
        <header>
          <p className='pageHeader'>Explore</p>
        </header>
        <main>
        <p className="exploreHeading">Recommended</p>
          <Slider />
          <p className='exploreCategoryHeading'>Categories</p>
          <div className='exploreCategories'>
            <Link to={"/category/rent"}>
              <img className='exploreCategoryImg' src={rentcategoryImg} alt="rent" />
              <p className='exploreCategoryName'>Places for rent</p>
            </Link>

            <Link to={"/category/sale"}>
              <img className='exploreCategoryImg' src={sellCategoryImg} alt="rent" />
              <p className='exploreCategoryName'>Places for sale</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Explore
