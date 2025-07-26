import { Router } from 'express';
import { sanitizePago, findAll, findOne, add, remove, update } from './pago.controller.js';

const routerPago = Router();

routerPago.get('/', findAll);
routerPago.get('/:idPago', findOne);
routerPago.post('/', sanitizePago, add);
routerPago.patch('/:idPago', sanitizePago, update);
routerPago.put('/:idPago', sanitizePago, update);
routerPago.delete('/:idPago', remove);

