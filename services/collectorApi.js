const axios = require('axios')


const collectorApi = axios.create({
    baseURL: 'http://47.243.132.219:4000/api/Device'
})

module.exports = collectorApi