import { Mascota } from './mascota.entity.js';
import { orm } from '../shared/db/orm.js';
function sanitizeMascota(req, res, next) {
    req.body.sanitizeInput = {
        idMascota: req.body.idMascota,
        nomMascota: req.body.nomMascota,
        dueno: req.body.dueno,
        especie: req.body.especie,
        raza: req.body.raza,
        edad: req.body.edad,
        peso: req.body.peso
    };
    Object.keys(req.body.sanitizeInput).forEach((key) => {
        if (req.body.sanitizeInput[key] === undefined) {
            delete req.body.sanitizeInput[key];
        }
    });
    next();
}
const em = orm.em;
async function findAll(req, res) {
    try {
        const mascotas = await em.find(Mascota, {}, { populate: ['dueno', 'especie'] });
        res.status(200).json({ message: 'finded all mascotas', data: mascotas });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving mascotas", error: error.message });
    }
}
async function findOne(req, res) {
    try {
        const idMascota = Number(req.params.idMascota);
        const mascota = await em.findOneOrFail(Mascota, { idMascota }, { populate: ['dueno', 'especie'] });
        res.status(200).json({ message: 'Mascota found', data: mascota });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving mascota", error: error.message });
    }
}
async function add(req, res) {
    try {
        const mascota = em.create(Mascota, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Mascota created', data: mascota });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating mascota", error: error.message });
    }
}
async function update(req, res) {
    try {
        const idMascota = Number(req.params.idMascota);
        const mascota = await em.findOneOrFail(Mascota, { idMascota });
        em.assign(mascota, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Mascota updated', data: mascota });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating mascota", error: error.message });
    }
}
async function remove(req, res) {
    try {
        const idMascota = Number(req.params.idMascota);
        const mascota = await em.findOneOrFail(Mascota, { idMascota });
        await em.removeAndFlush(mascota);
        res.status(200).json({ message: 'Mascota removed', data: mascota });
    }
    catch (error) {
        res.status(500).json({ message: "Error removing mascota", error: error.message });
    }
}
export { sanitizeMascota, findAll, findOne, add, update, remove };
//# sourceMappingURL=mascota.controller.js.map