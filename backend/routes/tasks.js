const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  listTasks, createTask, updateTask, deleteTask, toggleTask
} = require('../services/taskService');

router.use(auth);
router.get('/', listTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTask);

module.exports = router;
