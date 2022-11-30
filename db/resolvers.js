const Proyecto = require('../models/proyecto')
const Usuario = require('../models/usuario')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tarea = require('../models/Tarea')
require('dotenv').config({path:'variables.env'})

//crea y firma un JWT
const crearToken = (usuario,secreta,expiresIn) => {
    // console.log(usuario)
    const {id,email,nombre} = usuario
    return jwt.sign({id,email,nombre},secreta,{expiresIn})//firmamos el jwt
}


const resolvers = { //son funciones de consultas a la DB
    Query:{ 
        // obtenerCursos: () => cursos,
        // obtenerTecnologia: () => cursos
        obtenerProyectos: async (_,{},ctx) =>{
            const proyectos = await Proyecto.find({creador:ctx.usuario.id}) //solo proyectos de la persona autenticada
            return proyectos
        },
        obtenerTareas: async (_,{input},ctx) =>{
            const tareas = await Tarea.find({creador:ctx.usuario.id}).where('proyecto').equals(input.proyecto)
            return tareas
        }
    },
    Mutation:{
                   //1.root //2.Argumentos que se le pasan //3.context(revisa el usuario autenticado) //4. informacion relevante
        crearUsuario: async (_,{input}) =>{
            // const {nombre,email,password} = input
            // console.log(nombre) 
            const {email,password} = input
            const existeUsuario = await Usuario.findOne({email})
            // console.log(existeUsuario)
            //si el usuario existe
            if(existeUsuario){
                throw new Error('El usuario ya esta registrado')
            }else{
                try{
                    //Hasear password
                    const salt = await bcryptjs.genSalt(10) //genera una cadena muy dificil de adivinar.
                    input.password = await bcryptjs.hash(password,salt)
                    //registrar nuevo usuario
    
                    const nuevoUsuario = new Usuario(input);
                    // console.log(nuevoUsuario)
    
                    nuevoUsuario.save()
                    
                    return "Usuario creado correctamente"
                    
                }catch(error){
                    console.log(error)
                }
            }
            
        },
        autenticarUsuario: async (_,{input}) =>{
            const {email,password} = input
            //revisar si el usuario existe
            const existeUsuario = await Usuario.findOne({email})
            if(!existeUsuario){
                throw new Error('El usuario no existe')
            }
            //si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password,existeUsuario.password)
            if(!passwordCorrecto){
                throw new Error('Password Incorrecto') 
            }
            //Dar acceso a la app
            return {
                token: crearToken(existeUsuario,process.env.SECRETA,'4hr') //lo que dura el token
            }
        },
        nuevoProyecto: async (_,{input},ctx) =>{
            // console.log('Desde Resolver',ctx)
            try{
                const proyecto = new Proyecto(input)
                //asociar el creador
                proyecto.creador = ctx.usuario.id
                //almacenarlo en la DB
                const resultado = await proyecto.save()
                return resultado
            }catch(error){
                console.log(error)
            }
        },
        actualizarProyecto: async (_,{id,input},ctx) =>{
            //revisar si el proyecto existe o no
            let proyecto = await Proyecto.findById(id)
            if(!proyecto){
                throw new Error('Proyecto no encontrado')
            }

            //revisar que si la persona que trate de editarlo es el creador

            // console.log( typeof proyecto.creador)
            if(proyecto.creador.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales para editar')
            }

            //guardar el proyecto
            proyecto = await Proyecto.findOneAndUpdate({_id:id},input,{new:true})
            return proyecto
        },
        eliminarProyecto: async (_,{id},ctx) =>{
          //revisar si el proyecto existe o no
          let proyecto = await Proyecto.findById(id)
          if(!proyecto){
              throw new Error('Proyecto no encontrado')
          }
          //revisar que si la persona que trate de eliminarlo es el creador
          // console.log( typeof proyecto.creador)
          if(proyecto.creador.toString() !== ctx.usuario.id){
              throw new Error('No tienes las credenciales para editar')
          }
          //eliminar 
          await Proyecto.findByIdAndDelete({_id:id})
          return "Proyecto Eliminado"
        },
        nuevaTarea:async (_,{input},ctx) =>{
            try{
                const tarea = new Tarea(input)
                tarea.creador = ctx.usuario.id

                const resultado = await tarea.save()

                return resultado
            }catch(error){
                console.log(error)
            }
        },
        actualizarTarea:async (_,{id,input,estado},ctx) =>{
            //revisar si la tarea existe o no 
            let tarea = await Tarea.findById(id)
            if(!tarea){
                throw new Error('Tarea no encontrada')
            }
            //si la persona que edita es el creador
            if(tarea.creador.toString() !== ctx.usuario.id){
                throw new Error('No tienes las credenciales para editar')
            }

            //asignar estado 
            input.estado = estado;

            //guardar y retornar la tarea
            tarea = await Tarea.findOneAndUpdate({_id:id},input,{new:true})
            return tarea
        },
        eliminarTarea:async (_,{id},ctx)=>{
           //revisar si la tarea existe o no
          let tarea = await Tarea.findById(id)
          if(!tarea){
              throw new Error('Tarea no encontrada')
          }
          //revisar que si la persona que trate de eliminarlo es el creador
          if(tarea.creador.toString() !== ctx.usuario.id){
              throw new Error('No tienes las credenciales para eliminar')
          }

          //eliminar 
          await Tarea.findByIdAndDelete({_id:id})
          return "Tarea Eliminada"
        }
    }
}

module.exports = resolvers