import express from "express";
import ClassesController from "./controllers/ClassesController";
import ConnectionsController from "./controllers/ConnectionsController";

const routes = express.Router();
const classesController = new ClassesController();
const connectionsController = new ConnectionsController();

// Route Params: Identificar qual recurso devo atualizar ou deldetar
// app.get('/users:id', (req, res) => {}

// Query Params: utilizado para consulta, filtro, ordenação, paginação

routes.get('/', (req, res) => {
    return res.json({ message: 'hello world' });
});

routes.get('/classes', classesController.index);
routes.post('/classes', classesController.create);

routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);


export default routes;
