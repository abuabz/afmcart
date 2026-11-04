import fs from "fs";


export function deleteImageFromFileSystem(imagePath: string|null){
    
    // console.log("someone is deleting image")
    if(imagePath&&fs.existsSync(imagePath))        
        fs.rmSync(imagePath)
        
}


export function removeAllImageFromFileSystem(imagePaths: (string|null)[]){
    imagePaths.forEach(imagePath => {
        if(imagePath&&fs.existsSync(imagePath))        
            fs.rmSync(imagePath, { recursive: true, force: true })
    });
}

export const moveFile = (source: string, destination: string): void => {
    fs.rename(source, destination, (err) => {
        if (err) {
            console.error('Error moving file:', err);
        } else {
            
            console.log('File moved successfully! from',source,' to ',destination);
        }
    });
};
