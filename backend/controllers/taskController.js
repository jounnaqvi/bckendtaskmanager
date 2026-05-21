const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// POST /api/v1/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      createdBy: req.user._id,
    });
    return successResponse(res, 201, 'Task created', task);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/tasks
const getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { createdBy: req.user._id };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;

    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Admin sees all tasks
    if (req.user.role === 'admin') {
      delete filter.createdBy;
    }

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    return successResponse(res, 200, 'Tasks fetched', tasks, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/tasks/:id
const getTask = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.createdBy = req.user._id;

    const task = await Task.findOne(query).populate('createdBy', 'name email');
    if (!task) {
      return errorResponse(res, 404, 'Task not found.');
    }
    return successResponse(res, 200, 'Task fetched', task);
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.createdBy = req.user._id;

    const task = await Task.findOneAndUpdate(
      query,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return errorResponse(res, 404, 'Task not found or not authorized.');
    }
    return successResponse(res, 200, 'Task updated', task);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    // Regular users can only delete their own tasks; admins can delete any
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.createdBy = req.user._id;

    const task = await Task.findOneAndDelete(query);
    if (!task) {
      return errorResponse(res, 404, 'Task not found or not authorized.');
    }
    return successResponse(res, 200, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
