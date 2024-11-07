const logger = require('./logger');
const path = require('path');

async function imageUpload(data){
    return new Promise (async (res, rej) => {
        try{         
            const filename = data.imagename;
            const imageData = data.imagedata;
            const decodedImage = Buffer.from(imageData, 'base64');
            const imagePath = path.join('./screenshot', filename);
            logger.info(`imagePath: ${imagePath}`);
            logger.info(`file name: ${filename}`);
            require('fs').writeFile(imagePath, decodedImage, 'binary', (err) => {
                if (err) {
                    logger.error(`Error: ${err}`);
                    rej(err);
                }
                logger.info(`Image saved successfully : ${imagePath}`);
                res();
            })
        }catch(err){
            logger.info(`imageUpload : There is some problme with image data ${err} [Data] : ${data}`);
            rej(err);
        }        
    });
}

module.exports = imageUpload;