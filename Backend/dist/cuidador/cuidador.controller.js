import bcrypt from 'bcrypt';
import { orm } from '../shared/db/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { authenticate } from '../usuario/usuario.controller.js';
import { Cuidador } from './cuidador.entity.js';
const em = orm.em;
const sanitizeCuidador = (req, res, next) => {
    req.body.sanitizeInput = {
        email: req.body.email,
        password: req.body.password,
        nombre: req.body.nombre,
        nroDocumento: req.body.nroDocumento,
        tipoDocumento: req.body.tipoDocumento,
        telefono: req.body.telefono,
        telefonoEmergencia: req.body.telefonoEmergencia,
        sexoCuidador: req.body.sexoCuidador,
        tipoUsuario: 'cuidador'
    };
    next();
};
async function findAll(req, res) {
    try {
        const cuidadores = await em.find(Cuidador, {});
        res.status(200).json({ message: 'Found all cuidadores', data: cuidadores });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving cuidadores", error: error.message });
    }
}
async function findOne(req, res) {
    try {
        const idUsuario = Number(req.params.idUsuario);
        const cuidador = await em.findOneOrFail(Cuidador, { idUsuario });
        res.status(200).json({ message: 'Cuidador found', data: cuidador });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving cuidador", error: error.message });
    }
}
async function add(req, res) {
    console.log("Adding cuidador with name:", req.body.nombre);
    const email = await em.findOne(Usuario, { email: req.body.email });
    if (!email) {
        try {
            console.log("adding", req.body.sanitizeInput.nombre);
            await authenticate(req.body.sanitizeInput, res);
            req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
            const cuidador = em.create(Cuidador, req.body.sanitizeInput);
            await em.flush();
            res.status(200).json({ message: 'cuidador created', data: cuidador });
            return;
        }
        catch (error) {
            res.status(500).json({ message: "Error creating cuidador", error: error.message });
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
        const cuidador = await em.findOneOrFail(Cuidador, { idUsuario: idUsuario });
        em.assign(cuidador, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Cuidador updated', data: cuidador });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating cuidador", error: error.message });
    }
}
async function remove(req, res) {
    try {
        const idUsuario = Number.parseInt(req.params.idUsuario);
        const cuidador = await em.findOneOrFail(Cuidador, { idUsuario: idUsuario });
        await em.removeAndFlush(cuidador);
        res.status(200).json({ message: 'Cuidador removed', data: cuidador });
    }
    catch (error) {
        res.status(500).json({ message: "Error removing cuidador", error: error.message });
    }
}
export { sanitizeCuidador, findAll, findOne, add, update, remove };
//# sourceMappingURL=cuidador.controller.js.map