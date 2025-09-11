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
    const { 
      title, 
      description, 
      category, 
      priority = 'MEDIUM', 
      dueDate, 
      estimatedMinutes 
    } = req.body;
    
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'Title required' });
    }

    // Validate priority if provided
    if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority. Must be LOW, MEDIUM, or HIGH' });
    }

    // Validate estimatedMinutes if provided
    if (estimatedMinutes && (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 1)) {
      return res.status(400).json({ message: 'Estimated minutes must be a positive integer' });
    }

    const taskData = {
      title,
      description,
      category,
      priority,
      userId: req.user.id
    };

    // Add optional fields only if they have values
    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }
    if (estimatedMinutes) {
      taskData.estimatedMinutes = estimatedMinutes;
    }

    const task = await prisma.task.create({ data: taskData });
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
    const { 
      title, 
      description, 
      category, 
      completed, 
      priority, 
      dueDate, 
      estimatedMinutes,
      completedAt 
    } = req.body;

    // Validate priority if provided
    if (priority && !['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority. Must be LOW, MEDIUM, or HIGH' });
    }

    // Validate estimatedMinutes if provided
    if (estimatedMinutes && (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 1)) {
      return res.status(400).json({ message: 'Estimated minutes must be a positive integer' });
    }

    const updateData = {};
    
    // Only update fields that are provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;
    
    // Handle completion status and completedAt
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        // If marking as completed, set completedAt to provided value or current time
        updateData.completedAt = completedAt ? new Date(completedAt) : new Date();
      } else {
        // If marking as not completed, clear completedAt
        updateData.completedAt = null;
      }
    } else if (completedAt !== undefined) {
      // If only completedAt is provided
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    }

    // Handle dueDate
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    const updated = await prisma.task.update({
      where: { id, userId: req.user.id },    // ownership check
      data: updateData
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
    const deleted = await prisma.task.delete({ 
      where: { id, userId: req.user.id } // Add ownership check
    });
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
    const current = await prisma.task.findUnique({ 
      where: { id, userId: req.user.id } // Add ownership check
    });
    if (!current) return res.status(404).json({ message: 'Not found' });
    
    const newCompletedState = !current.completed;
    const updateData = {
      completed: newCompletedState,
      completedAt: newCompletedState ? new Date() : null
    };

    const updated = await prisma.task.update({
      where: { id },
      data: updateData
    });
    
    const io = req.app.get('io');
    io.emit('task_updated', updated);
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};
