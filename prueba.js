const fs = require('fs');
const path = require('path');
const axios = require('axios').default;

const downloadFile = async (fileUrl) => {
    const fileName = path.basename(fileUrl);

    const localFilePath = path.resolve(__dirname, 'img', fileName);
    try {
        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
        });

        const w = await response.data.pipe(fs.createWriteStream(localFilePath));
        w.on('finish', () => {

            // console.log(localFilePath);
        });



    } catch (err) {
        throw new Error(err);
    }
    return localFilePath
};


const functioSyn = async () => {
    
    console.log(await downloadFile('https://www.kindacode.com/wp-content/uploads/2021/01/test.jpg'))
}

