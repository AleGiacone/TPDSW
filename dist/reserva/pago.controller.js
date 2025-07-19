import { Pago } from './pago.entity.js';
import { orm } from '../shared/db/orm.js';
// Ver como hacer el tema de pago, si implementar un medio de pago real o dejar
function sanitizePago(req, res, next) {
    req.body.sanitizeInput = {
        idPago: req.body.idPago,
        idReserva: req.body.idReserva,
        monto: req.body.monto,
        fechaPago: req.body.fechaPago
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
        const pagos = await em.find(Pago, {});
        res.status(200).json({ message: 'Found all pagos', data: pagos });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving pagos", error: error.message });
    }
}
async function findOne(req, res) {
    try {
        const idPago = Number(req.params.idPago);
        const pago = await orm.em.findOneOrFail(Pago, { idPago });
        res.status(200).json({ message: 'Pago found', data: pago });
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving pago", error: error.message });
    }
}
async function add(req, res) {
    try {
        const pago = em.create(Pago, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Pago created', data: pago });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating pago", error: error.message });
    }
}
async function update(req, res) {
    try {
        const idPago = Number.parseInt(req.params.idPago);
        const pago = await em.findOneOrFail(Pago, { idPago });
        em.assign(pago, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Pago updated', data: pago });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating pago", error: error.message });
    }
}
async function remove(req, res) {
    try {
        const idPago = Number.parseInt(req.params.idPago);
        const pago = await em.findOneOrFail(Pago, { idPago });
        await em.removeAndFlush(pago);
        res.status(200).json({ message: 'Pago removed', data: pago });
    }
    catch (error) {
        res.status(500).json({ message: "Error removing pago", error: error.message });
    }
}
export { sanitizePago, findAll, findOne, add, update, remove };
//# sourceMappingURL=pago.controller.js.map