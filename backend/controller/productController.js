const Product=require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncErrors=require('../middleware/catchAsyncErrors')
const ApiFeature=require('../utils/apifeatures')


//create Product--Admin
exports.createProduct=catchAsyncErrors(async(req,res,next)=>{

    req.body.user=req.user.id
    const product=await Product.create(req.body);
    res.status(200).json({
        success:true,
        product
    })
})

//Get All Product
exports.getAllProducts=catchAsyncErrors(async(req,res,next)=>{

    const resultPerPage=8;
    const productsCount=await Product.countDocuments()
    const apiFeature=new ApiFeature(Product.find(),req.query)
    .search()
    .filter()
    
    let products =await apiFeature.query;

    let filteredProductsCount = products.length;
    apiFeature.pagination(resultPerPage)

     products= await apiFeature.query.clone();
    // const product= await Product.find();

    res.status(200).json({
        success:true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount
        })
})

//Get Single Product details

exports.getProductDetails= catchAsyncErrors(async (req,res,next)=>{

    const product= await Product.findById(req.params.id);
   
    if (!product) {
        return next(new ErrorHandler("Product not found",404))
    }

    res.status(200).json({
        success:true,
        product
    })
})

//Update Product ---Admin

exports.updateProduct=catchAsyncErrors(async (req,res,next) =>{

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found",404))
    }
    
    product= await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        product
    })
})

//Delete Product--- Admin 
exports.deleteProduct=catchAsyncErrors(async (req,res,next)=>{

    const product= await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found",404))
    }
    
    await product.remove();

    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })

})

//Create New Review or Update the review
exports.createProductReview= catchAsyncErrors(async(req,res,next)=>{
    const{rating,comment,productId}= req.body;

    const review= {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    }
    const product = await Product.findById(productId)
    
//if already revivewed then Updating the review ------
    const isReviewed= product.reviews.find(
        (rev)=> rev.user.toString() === req.user._id.toString() //its for already reviewd
        );
    
    if (isReviewed) {
        product.reviews.forEach(rev => {
            if(rev.user.toString() === req.user._id.toString())
             rev.rating=rating;
             rev.comment=comment   
        });
    } else {
        product.reviews.push(review)
        product.numOfReviews = product.reviews.length
    }

//ex: 4,5,2,6 =total 17/total length
    let avg=0;
    product.reviews.forEach(rev => {
        avg += rev.rating
    })
    product.ratings= avg / product.reviews.length;

    await product.save({ validatorBeforeSave : false })
    res.status(200).json({
        success:true,

    })  
})


//Get All Reviews  of a Product

exports.getProductReviews= catchAsyncErrors(async(req,res,next)=>{

    const product= await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("Product not found",404))
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews,
    })
})

//Delete reviews
exports.deleteReview= catchAsyncErrors(async(req,res,next)=>{

    const product= await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product not found",404))
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
        );

    let avg=0;
    reviews.forEach((rev) => {
        avg += rev.rating
    })
    const ratings= avg / reviews.length;

    const numOfReviews= reviews.length

    await Product.findByIdAndUpdate(req.query.productId,{
       reviews,
        ratings,
        numOfReviews,
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })
    res.status(200).json({
        success:true,
    })
})
