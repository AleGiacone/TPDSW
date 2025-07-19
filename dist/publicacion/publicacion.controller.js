import { orm } from '../shared/db/orm.js';
import { Publicacion } from './publicacion.entity.js';
function sanitizePublicacion(req, res, next) {
    req.body.sanitizeInput = {
        idPublicacion: req.body.idPublicacion,
        idCuidador: req.body.idCuidador,
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        fechaPublicacion: req.body.fechaPublicacion
    };
    next();
}
const em = orm.em;
async function findAll(req, res) {
    try {
        const publicaciones = await em.find(Publicacion, {}, { populate: ['reservas'] });
        res.status(200).json({ message: 'Found all publicaciones', data: publicaciones });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving publicaciones", error: error.message });
    }
}
async function findOne(req, res) {
    try {
        const idPublicacion = Number(req.params.idPublicacion);
        const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas'] });
        res.status(200).json({ message: 'Publicacion found', data: publicacion });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving publicacion", error: error.message });
    }
}
async function add(req, res) {
    try {
        const publicacion = em.create(Publicacion, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Publicacion created', data: publicacion });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating publicacion", error: error.message });
    }
}
async function update(req, res) {
    try {
        const idPublicacion = Number.parseInt(req.params.idPublicacion);
        const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion });
        em.assign(publicacion, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Publicacion updated', data: publicacion });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating publicacion", error: error.message });
    }
}
async function remove(req, res) {
    try {
        const idPublicacion = Number.parseInt(req.params.idPublicacion);
        const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion });
        await em.removeAndFlush(publicacion);
        res.status(200).json({ message: 'Publicacion removed', data: publicacion });
    }
    catch (error) {
        res.status(500).json({ message: "Error removing publicacion", error: error.message });
    }
}
export { sanitizePublicacion, findAll, findOne, add, update, remove };
//# sourceMappingURL=publicacion.controller.js.map