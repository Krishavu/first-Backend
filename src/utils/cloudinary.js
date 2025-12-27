import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const uploadToCloudinary= async (localFilePath)=>{
    try {
        if(!localFilePath){
            throw new Error("File path is required");
        }
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath); // delete file from local server after upload
        return response;


    } catch (error) {
        // fs.unlinkSync(localFilePath);
        // return null;
        // above code was giving error
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.error("Cloudinary upload failed:", error);
        return null;
    } 
}
export {uploadToCloudinary};