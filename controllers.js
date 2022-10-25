const axios = require('axios')
require('dotenv').config()
const fs = require('fs');
const path = require('path');


const { USER_NAME_CREDENTIAL } = process.env
const { PASSWORD_CREDENTIAL } = process.env

var token
var numMinutes = 1
var expirationTime

const calculateExpirationTime = () => {
    let now = new Date();
    let expirationTimeBis = new Date();
    expirationTimeBis.setTime(now.getTime() + numMinutes * 60 * 1000)
    expirationTime = expirationTimeBis
}

const validateToken = async () => {
    if (!token) {
        await getToken()
    } else if (expirationTime <= new Date()) {
        await refreshToken()
    }
}

const getToken = async () => {
    let user =
    {
        "username": USER_NAME_CREDENTIAL,
        "password": PASSWORD_CREDENTIAL
    }
    await axios.post("https://platform.rudolphtrading.com/api/token/", user
    )
        .then(function (response) {
            token = response.data;
            calculateExpirationTime()

        })
        .catch(function (error) {
            console.log(error)
        });
}

const refreshToken = async () => {

    let resfresh = {
        refresh: token.refresh
    }
    await axios.post("https://platform.rudolphtrading.com/api/token/refresh/", resfresh
    )
        .then(function (response) {
            token = response.data;
            calculateExpirationTime()

        })
        .catch(function (error) {
            console.log(error)
        });
}

const getStockQuote = async (symbol) => {
    let symbolUpperCase = symbol.toUpperCase();

    await validateToken()

    let resp = await axios.get(`https://platform.rudolphtrading.com/api/v1/stock/quote/${symbolUpperCase}`,
        {
            headers: {
                Authorization: `Bearer ${token.access}`
            }
        }
    )
        .then(function (response) {
            return response.data

        })
        .catch(function (error) {
            if (error.response.status === 404) {
                return false
            }
            return false
            // console.log(error.response.status);
        });
    return resp
}

const replaceMarkDown = (data) => {

    if (data === null) {
        return "\\-"
    } else {
        let res = data.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, "\\.")
        return res
    }
}

const differentialPercentage = (last, close, previous_close) => {

    if (last) {

        let res = (parseFloat(last) / parseFloat(previous_close) - 1) * 100
        return res.toFixed(2).toString().replace('.', ',')
    }
    if (close) {

        let res = (parseFloat(close) / parseFloat(previous_close) - 1) * 100
        return res.toFixed(2).toString().replace('.', ',')
    }
}


const downloadFile = async (fileUrl) => {
    let localFilePath
    try {
        const response = await axios({
            method: 'GET',
            url: fileUrl,
            responseType: 'stream',
        })
            .then(function (response) {
                const fileName = path.basename(fileUrl);

                localFilePath = path.resolve(__dirname, 'img', fileName);

                const w = response.data.pipe(fs.createWriteStream(localFilePath));


                w.on('finish', () => {

                    // console.log(localFilePath);
                });

            })
        return localFilePath
    }
    catch (err) {
        throw new Error(err);
    }
};



const getStockChart = async (symbol, timeFrames) => {

    try {
        await validateToken()
        let allowedTimeframes = ['1d', '4h', '1h', '30m', '15m', '5m', '1m', '1w']
        let defaultTimeframe = '1d'
        let symbolUpperCase = symbol.toUpperCase();

        if (allowedTimeframes.includes(timeFrames)) {
            //aca mando imagen con el dia q el cliente pide
            let url = await downloadFile('https://www.kindacode.com/wp-content/uploads/2021/01/test.jpg')
            return {
                status: "succes",
                url: url
            }
        } 
        else if (timeFrames && !allowedTimeframes.includes(timeFrames)) {
            return {
                status: "error",
                message: "Time frame las opciones son:  `1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w`"
            }

        } else {

            //aca mando imagen con un dia por default
            let url = await downloadFile('https://www.kindacode.com/wp-content/uploads/2021/01/test.jpg')
            return {
                status: "succes",
                url: url
            }
        }
    } catch (error) {
        console.log("entre en getStockChart")
    }


}


module.exports = { getToken, getStockQuote, replaceMarkDown, differentialPercentage, getStockChart }