import { TipoRepository } from './tipo.repository.js';
import { Tipo } from './tipo.entity.js';
const repository = new TipoRepository();
function sanitizeTipo(req, res, next) {
    req.body.sanitizeInput = {
        especie: req.body.especie,
        raza: req.body.raza,
    };
    Object.keys(req.body.sanitizeInput).forEach((key) => {
        if (req.body.sanitizeInput[key] === undefined) {
            delete req.body.sanitizeInput[key];
        }
    });
    next();
}
function findAll(req, res) {
    res.json({ data: repository.findAll() });
    console.log("Entró a findAll tipo controller");
}
function findOne(req, res) {
    const raza = req.params.raza;
    const tipo = repository.findOne({ raza });
    if (!tipo) {
        res.status(404).send({ message: "tipo not found" });
        return;
    }
    res.json({ data: tipo });
}
function add(req, res) {
    const input = req.body.sanitizeInput;
    const { especie, raza } = req.body;
    const tipoInput = new Tipo(input.especie, input.raza);
    const tipo = repository.add(tipoInput);
    res.status(201).json({ message: "tipo created", data: tipoInput });
}
function update(req, res) {
    req.body.sanitizeInput.raza = req.params.raza;
    const tipo = repository.update(req.body.sanitizeInput);
    if (!tipo) {
        res.status(404).send({ message: "tipo not found" });
        return;
    }
    res.status(200).json({ message: "tipo updated", data: tipo });
}
function remove(req, res) {
    const raza = req.params.raza;
    const tipo = repository.findOne({ raza });
    if (!tipo) {
        res.status(404).send({ message: "tipo not found" });
        return;
    }
    else {
        repository.delete({ raza });
    }
    res.status(200).json({ message: "tipo deleted", data: tipo });
}
export { sanitizeTipo, findAll, findOne, add, update, remove };
//# sourceMappingURL=tipo.controler.js.map