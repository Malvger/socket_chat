const { io } = require('../server');

const { Usuarios } = require('../classes/usuarios')

const { crearMesaje } = require('../utilidades/utilidades')

const usuarios = new Usuarios;


io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {
        console.log(data);
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre es necesario'
            })
        }
        client.join(data.sala);
        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        //client.broadcast.emit('listaPersona', usuarios.getPersonas());

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasSala());
        callback(usuarios.getPersonasSala(data.sala));
    });

    client.on('crearMesaje', (data) => {
        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMesaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMesaje', mensaje);
    });

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('crearMesaje', crearMesaje('Administrador', `${personaBorrada.nombre} salio`, ));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasSala());
    });

    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMesaje(persona.nombre, data.mensaje));
    });

});