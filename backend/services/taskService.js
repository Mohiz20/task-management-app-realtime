const prisma = require('../db');

function toInt(id) {
  const n = Number(id);
  if (!Number.isInteger(n)) throw new Error('Invalid id');
  return n;
}

exports.listTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || typeof title !== 'string') return res.status(400).json({ message: 'Title required' });
    const task = await prisma.task.create({
      data: { title, description, category, userId: req.user.id }
    });
    const io = req.app.get('io');
    io.emit('task_created', task);
    res.status(201).json(task);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    const { title, description, category, completed } = req.body;
    const updated = await prisma.task.update({
      where: { id },
      data: { title, description, category, completed }
    });
    const io = req.app.get('io');
    io.emit('task_updated', updated);
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    const deleted = await prisma.task.delete({ where: { id } });
    const io = req.app.get('io');
    io.emit('task_deleted', { id: deleted.id });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleTask = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    const current = await prisma.task.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ message: 'Not found' });
    const updated = await prisma.task.update({
      where: { id },
      data: { completed: !current.completed }
    });
    const io = req.app.get('io');
    io.emit('task_updated', updated);
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
