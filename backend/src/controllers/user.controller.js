/**
 * User controller.
 */
const UserService = require('../services/user.service');

const UserController = {
  // GET /users  (admin only) — optional ?role=employee filter
  async list(req, res) {
    const { role } = req.query;
    const users = await UserService.listUsers({ role });
    res.json({ data: users });
  },

  async create(req, res) {
  const user = await UserService.createEmployee(req.body, req.user);
  res.status(201).json({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
},

async updateStatus(req, res) {
  const user = await UserService.updateEmployeeStatus(
    Number(req.params.id),
    req.body.is_active,
    req.user
  );

  res.json({ data: user });
},

  // GET /users/:id/tasks — tasks for a specific employee (paginated/filterable)
  async tasks(req, res) {
    const { id } = req.params;
    const { status, dueBefore, dueAfter, page, limit, sortBy, order } = req.query;
    const result = await UserService.getTasksForUser(
      Number(id),
      {
        status,
        dueBefore,
        dueAfter,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy,
        order,
      },
      req.user
    );
    res.json(result);
  },
};

module.exports = UserController;
