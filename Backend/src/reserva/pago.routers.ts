import { Router } from 'express';
import { sanitizePago, findAll, findOne, add, remove, update} from './pago.controller.js';

const pagoRouter = Router();

// pagoRouter.post('/test/stripe', testPagoStripe);

// // pagoRouter.get('/', findAll);
// // pagoRouter.get('/:idPago', findOne);
// // pagoRouter.post('/', sanitizePago, add);
// pagoRouter.patch('/:idPago', sanitizePago, update);
// pagoRouter.put('/:idPago', sanitizePago, update);
// pagoRouter.delete('/:idPago', remove);

// // Testing stripe

// const webHookRouter = Router();


// // Primero pasar por el
// webHookRouter.post('/', stripeWebHook);



export { pagoRouter} ;