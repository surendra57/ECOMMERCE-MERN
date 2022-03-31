import React,{ useEffect,useState } from 'react'
import Carousel from 'react-material-ui-carousel'
import './ProductDetails.css'
import { useSelector,useDispatch} from 'react-redux'
import { clearErrors, getProductDetails } from '../../actions/productAction'
import { useParams } from "react-router-dom";
import ReactStars from 'react-rating-stars-component';
import Reviewcard from './Reviewcard.js';
import Loader from '../layout/loader/Loader';
import {useAlert} from 'react-alert';
import MetaData from '../layout/MetaData';
import { addItemsToCart } from '../../actions/cartAction';

const ProductDetails = () => {
  const alert=useAlert();

  const { id } = useParams();//for get route id
  const dispatch = useDispatch();
  const {product,loading,error } = useSelector(state=>state.productDetails)
  
  const options ={
    edit : false,
    color:"rgba(20,20,20,0.1)",
    activeColor:"rgb(255,164,28)",
    size:window.innerWidth < 600 ? 20:20,
    value:product.ratings,
    isHalf:true,
  }

  const [quantity, setQuantity] = useState(1)

  const increseQuantity = ()=>{
    if(product.stock <= quantity)return;
    
    const qty = quantity + 1;
    setQuantity(qty)
  }

  const decreaseQuality = () =>{
    if( 1 >= quantity)return;
    
    const qty = quantity - 1;
    setQuantity(qty)
  }

  const addToCartHandler = () =>{
   dispatch(addItemsToCart(id,quantity));
   alert.success("Item added to Cart")
  }

  useEffect(() => {
    if (error) {
       alert.error(error);
       dispatch(clearErrors());
      }
    dispatch(getProductDetails(id))
  }, [dispatch ,id,error,alert])

  
  
  return (
      <>
      {loading ? <Loader/> :<>
      <MetaData title={`${product.name}--ECOMMERCE`} />

      <div className='ProductDetails'>
            <div>
              <Carousel>
                {product.images && product.images.map((item,i)=>(
                  <img
                    className='CarouselImage' 
                    key={item.url}
                    src={item.url}
                    alt={`${i} Slide`}
                  />  
                ))}
              </Carousel>
            </div>
            <div>
                 <div className='detailsBlock-1'>
                    <h2>{product.name}</h2>
                    <p>Product # {product._id}</p>
                 </div>
                 <div className='detailsBlock-2'>
                    <ReactStars {...options} /> 
                    <span>({product.numOfReviews} reviews)</span>
                 </div>
                 <div className='detailsBlock-3'>
                    <h1>{`₹${product.price}`}</h1>
                  
                        <div className='detailsBlock-3-1'>
                          <div className='detailsBlock-3-1-1'>
                              <button onClick={decreaseQuality}>-</button>
                              <input type="number" readOnly value={quantity} />
                              <button onClick={increseQuantity}>+</button>
                          </div>
                          <button onClick={addToCartHandler} >Add to Cart</button>
                        </div>
                  
                    <p>
                      Status:
                      <b className={product.stock < 1 ? "redColor":"greenColor"}>
                          {product.stock < 1 ? "OutOfStock" : "InStock"}
                      </b>
                    </p>

                 </div>

                 <div className='detailsBlock-4'>
                   Description : <p>{product.description}</p>
                 </div>
                 <button className='submitReview'>Submit Review</button>
            </div>
      </div>

      <h3 className='reviewHeading'>REVIEWS</h3>
      {product.reviews && product.reviews[0] ? (
        <div  className='reviews'>
          {product.reviews && 
          product.reviews.map((review)=><Reviewcard key={review._id} review={review} />)}          
        </div>
      ) :(
        <p className='noReviews'>No Reviews Yet</p>
      ) }

      </>}
      </>
  )
}

export default ProductDetails
