import { Router } from 'express';
import { RequestController } from '../controllers/requestController';

const router = Router();
const controller = new RequestController();

router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.patch('/:id', controller.update);
router.post('/:id/take', controller.takeInProgress); // специальный маршрут для взятия в работу

export default router;