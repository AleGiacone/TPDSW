import { Dueno } from './dueno.entity.js';
import { orm } from '../shared/db/orm.js';
import { authenticate } from '../usuario/usuario.controller.js';
import { Usuario } from '../usuario/usuario.entity.js';
import bcrypt from 'bcrypt';
function sanitizeDueno(req, res, next) {
    req.body.sanitizeInput = {
        idUsuario: req.body.idUsuario,
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
        const idUsuario = Number(req.params.idUsuario);
        const dueno = await em.findOneOrFail(Dueno, { idUsuario });
        res.status(200).json({ message: 'Dueno found', data: dueno });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving dueno", error: error.message });
    }
}
async function add(req, res) {
    console.log("Adding usuario with body:", req.body);
    const email = await em.findOne(Usuario, { email: req.body.email });
    if (!email) {
        try {
            await authenticate(req.body.sanitizeInput, res);
            req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
            const dueno = em.create(Dueno, req.body.sanitizeInput);
            await em.flush();
            res.status(200).json({ message: 'Dueno created', data: dueno });
            return;
        }
        catch (error) {
            res.status(500).json({ message: "Error creating usuario", error: error.message });
            return;
        }
    }
    else {
        console.log("Email already exists:", email);
        res.status(400).json({ message: 'Email already exists' });
        return;
    }
}
async function update(req, res) {
    try {
        const idUsuario = Number.parseInt(req.params.idUsuario);
        const dueno = await em.findOneOrFail(Dueno, { idUsuario });
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
        const idUsuario = Number.parseInt(req.params.idUsuario);
        const dueno = await em.findOneOrFail(Dueno, { idUsuario });
        await em.removeAndFlush(dueno);
        res.status(200).json({ message: 'Dueno removed', data: dueno });
    }
    catch (error) {
        res.status(500).json({ message: "Error removing dueno", error: error.message });
    }
}
export { sanitizeDueno, findAll, findOne, add, update, remove };
//# sourceMappingURL=dueno.controller.js.map