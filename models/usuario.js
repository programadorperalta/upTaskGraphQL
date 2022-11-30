const mongoose = require('mongoose')
//ESTO ES SINTAXIS MONGO
const UsuariosSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type:String,
        required: true,
        trim: true,
        unique: true, //en facebook solo se puede tener un facebook por persona (con el email)
        lowercase:true
    },
    password:{
        type: String,
        required: true,
        trim: true
    },
    registro:{
        type: Date,
        default: Date.now() //una vez que alguien se registre toma la fecha actual (now en realidad toma la hora y segundos)
    }
})
//LOS MODELOS INTERACTUAN  CON LA BASE DE DATOS TODO EL TIEMPO

module.exports = mongoose.model('Usuario',UsuariosSchema)