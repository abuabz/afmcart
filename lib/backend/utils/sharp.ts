import sharp from "sharp";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';

export const compressImageToFolder = async ({ inputPath, quality, extension,outputRelativePath }: { inputPath: string,outputRelativePath:string, quality: number, extension: 'webp' | 'jpeg' | 'png' }) => {
    try {


        const generateUniqueId = () => {
            return uuidv4();
        };
        const fileName = `${generateUniqueId()}-compressed.${extension}`
        const compressedImagePath = `${process.cwd()}/${outputRelativePath}/${fileName}`;
        const compressedRelativePath = `/${outputRelativePath}/${fileName}`;

        // Use the appropriate format (jpeg, png, webp) dynamically
        sharp.cache(false)
        const sharpInstance = sharp(inputPath)

        switch (extension) {
            case 'webp':
                await sharpInstance.webp({ quality }).toFile(compressedImagePath); // Write the compressed file;
                break;
            case 'jpeg':
                await sharpInstance.jpeg({ quality }).toFile(compressedImagePath); // Write the compressed file;
                break;
            case 'png':
                await sharpInstance.png({ quality }).toFile(compressedImagePath); // Write the compressed file;
                break;
            default:
                throw new Error('Invalid image format');
        }


        return compressedRelativePath; // Return the path of the compressed image
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
};
export const compressImage = async ({ inputPath, quality, extension }: { inputPath: string, quality: number, extension: 'webp' | 'jpeg' | 'png' }) => {
    try {


        const generateUniqueId = () => {
            return uuidv4();
        };
        const compressedImagePath = `${process.cwd()}/public/temp/compressed/${generateUniqueId()}-compressed.${extension}`;

        // Use the appropriate format (jpeg, png, webp) dynamically
        sharp.cache(false)
        const sharpInstance = sharp(inputPath)

        switch (extension) {
            case 'webp':
                await sharpInstance.webp({ quality }).toFile(compressedImagePath); // Write the compressed file;
                break;
            case 'jpeg':
                await sharpInstance.jpeg({ quality }).toFile(compressedImagePath); // Write the compressed file;
                break;
            case 'png':
                await sharpInstance.png({ quality }).toFile(compressedImagePath); // Write the compressed file;
                break;
            default:
                throw new Error('Invalid image format');
        }


        return compressedImagePath; // Return the path of the compressed image
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
};