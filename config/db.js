const mongoose = require('mongoose')
require('dotenv').config({path:'variables.env'})

const conectarDB = async () => {
    try{
    await mongoose.connect(process.env.DB_MONGO)
    console.log('DB Conectada')
    }catch(error){
        console.log('Hubo un error')
        console.log(error)
        process.exit
    }
}

module.exports = conectarDB