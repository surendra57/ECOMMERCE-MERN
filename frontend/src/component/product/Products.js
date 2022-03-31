import React,{ useEffect,useState,useRef } from 'react'
import './Products.css'
import { useSelector,useDispatch} from 'react-redux'
import { clearErrors, getProduct } from '../../actions/productAction'
import Loader from '../layout/loader/Loader';
import ProductCard from "../home/ProductCard"
import { useParams } from "react-router-dom";
import Pagination from 'react-js-pagination';
import { useAlert } from 'react-alert';
import Slider from '@material-ui/core/Slider'
import Typography from '@material-ui/core/Typography'
import MetaData from '../layout/MetaData';

const categories= [
    "Laptop",
    "Footwear",
    "Bottom",
    "Tops",
    "Attire",
    "Camera",
    "SmartPhones"
]

const Products = () => {
    const dispatch=useDispatch();
    const alert=useAlert();
    const isMounted= useRef(true)

    const { keyword } = useParams();//for get route id
    const [currentPage, setCurrentPage] = useState(1)
    const [price, setPrice] = useState([0,25000])
    const [category, setCategory] = useState('')
    const [ratings, setRatings] = useState(0)

    const {
        products,
        loading,
        error,
        productsCount,
        resultPerPage,
        filteredProductsCount 
    } = useSelector(state=>state.products)
    
    const setCurrentPageNo=(e)=>{
        setCurrentPage(e)
    }
    const priceHandler=(e,newPrice)=>{
        setPrice(newPrice)
    }
    useEffect(() => {
       if(isMounted.current){
        if(error){
            alert.error(error)
            dispatch(clearErrors());
        }

        dispatch(getProduct(keyword,currentPage,price,category,ratings));
       }
        return (()=>{
            isMounted.current = false;
        })
    }, [dispatch,keyword,currentPage,price,category,ratings,alert,error])
    
    let count= filteredProductsCount;
  return <>
      {loading ? <Loader/>:<>

            <MetaData title="PRODUCTS--ECOMMERCE" />
        <h2 className='productsHeading'>Products</h2>
        <div className='products'>
        {products &&
           products.map((product)=>(
               <ProductCard key={product._id} product={product} />
           ))}
        </div>
        <div className='filterBox'>
        <Typography>Price</Typography>
        <Slider
        value={price}
        onChange={priceHandler}
        valueLabelDisplay="auto"
        aria-labelledby='range-slider'
        min={0}
        max={25000}
        />
        <Typography>Categories</Typography>
        <ul className='categoryBox'>
            {categories.map((category)=>(
                <li 
                className='category-link'
                key={category}
                onClick={ ()=> setCategory(category)}
                >
                    {category}
                </li>
            ))}
        </ul>
        <fieldset>
            <Typography component="legend">Ratings Above</Typography>
            <Slider
                value={ratings}
                onChange={(e,newRating)=>{
                    setRatings(newRating);
                }}
                aria-labelledby="continuous-slider"
                min={0}
                max={5}
                valueLabelDisplay="auto"
            />
        </fieldset>
        </div>
         {resultPerPage < count && (
                 <div className='paginationBox'>
                 <Pagination
                 activePage={currentPage}
                 itemsCountPerPage={resultPerPage}
                 totalItemsCount={productsCount}
                 onChange={setCurrentPageNo}
                 nextPageText="Next"
                 prevPageText="Prev"
                 firstPageText="1st"
                 lastPageText="Last"
                 itemClass='page-item'
                 linkClass='page-link'
                 activeClass='pageItemActive'
                 activeLinkClass='pageLinkActive'
                 />
             </div>
         )}   
      </>}
  </>
}

export default Products