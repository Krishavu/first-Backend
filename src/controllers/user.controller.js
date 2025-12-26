import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // check validation: not empty
    // check if user already exisit : email, username
    // check for images and check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token from response
    // check for user creation
    // return response


    //.....1) get user details from frontend
    const { fullName, email,  username, password } = req.body;
    console.log("email:", email);

    //.....2) check validation: not empty
                    // if(fullName === ""){
                    //     throw new ApiError(400, "Full name is required");
                    // }
    if([fullName, email, username, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required");
    }

    //.....3) check if user already exisit : email, username
    const existedUser = User.findOne({
        $or: [{email}, {username}]
    });

    if(existedUser){
        throw new ApiError(409, "User with given email or username already exist");
    }

    //.....4) check for images and check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required");
    }

    //.....5) upload them to cloudinary, avatar
    const avatar= await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar image is required");
    }

    //.....6) create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url||"",
        email,
        password,
        username: username.toLowerCase(),
    });

    //.....7) remove password and refresh token from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //.....8) check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    //.....9) return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
})

export {registerUser};