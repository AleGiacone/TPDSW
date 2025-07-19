import { Dueno } from './dueno.entity.js';
import { orm } from '../shared/db/orm.js';
function sanitizeDueno(req, res, next) {
    req.body.sanitizeInput = {
        idDueno: req.body.idDueno,
        nombre: req.body.nombre,
        nroDocumento: req.body.nroDocumento,
        tipoDocumento: req.body.tipoDocumento,
        telefono: req.body.telefono,
        telefonoEmergencia: req.body.telefonoEmergencia
    };
    next();
}
const em = orm.em;
async function findAll(req, res) {
    try {
        const duenos = await em.find(Dueno, {});
        res.status(200).json({ message: 'Found all duenos', data: duenos });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving duenos", error: error.message });
    }
}
async function findOne(req, res) {
    try {
        const idDueno = Number(req.params.idDueno);
        const dueno = await em.findOneOrFail(Dueno, { idDueno });
        res.status(200).json({ message: 'Dueno found', data: dueno });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving dueno", error: error.message });
    }
}
async function add(req, res) {
    try {
        const dueno = em.create(Dueno, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Dueno created', data: dueno });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating dueno", error: error.message });
    }
}
async function update(req, res) {
    try {
        const idDueno = Number.parseInt(req.params.idDueno);
        const dueno = await em.findOneOrFail(Dueno, { idDueno });
        em.assign(dueno, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Dueno updated', data: dueno });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating dueno", error: error.message });
    }
}
async function remove(req, res) {
    try {
        const idDueno = Number.parseInt(req.params.idDueno);
        const dueno = await em.findOneOrFail(Dueno, { idDueno });
        await em.removeAndFlush(dueno);
        res.status(200).json({ message: 'Dueno removed', data: dueno });
    }
    catch (error) {
        res.status(500).json({ message: "Error removing dueno", error: error.message });
    }
}
export { sanitizeDueno, findAll, findOne, add, update, remove };
//# sourceMappingURL=dueno.controller.js.map