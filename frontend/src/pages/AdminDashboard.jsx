import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

import KanbanBoard from '../components/KanbanBoard';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import TaskModal from '../components/TaskModal';
import { useToast } from '../components/Toast';
import { taskApi, userApi } from '../api/endpoints';

const PAGE_SIZE = 8;

export default function AdminDashboard() {
  const { push } = useToast();

  const [employees, setEmployees] = useState([]);
  const [employeeFormOpen, setEmployeeFormOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [employeeSaving, setEmployeeSaving] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
  total: 0,
  pending: 0,
  in_progress: 0,
  completed: 0,
  overdue: 0,
  });
  const [employeeWorkload, setEmployeeWorkload] = useState([]);
  const chartData = [
  { name: 'Pending', value: Number(summary.pending) },
  { name: 'In Progress', value: Number(summary.in_progress) },
  { name: 'Completed', value: Number(summary.completed) },
  { name: 'Overdue', value: Number(summary.overdue) },
];

const COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'];
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters (bonus).
  const [statusFilter, setStatusFilter] = useState('');
  const [dueBefore, setDueBefore] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  // Modal state.
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await taskApi.list({
        status: statusFilter,
        dueBefore,
        sortBy,
        order: sortBy === 'due_date' ? 'asc' : 'desc',
        page,
        limit: PAGE_SIZE,
      });
      setTasks(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dueBefore, sortBy, page]);

  // Load usres once.
  // Load users once.
useEffect(() => {
  loadEmployees();
}, []);

  // Load overall task statistics from the backend.
  useEffect(() => {
    taskApi.summary()
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
  taskApi.employeeWorkload()
    .then(setEmployeeWorkload)
    .catch((err) => setError(err.message));
  }, []);

  // Reset to page 1 whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dueBefore, sortBy]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const stats = useMemo(() => {
    // These reflect the current (filtered) page-set total via separate count;
    // for headline numbers we approximate from loaded tasks + total.
    const byStatus = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});
    return { byStatus };
  }, [tasks]);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(task) {
    setEditing(task);
    setModalOpen(true);
  }

  async function handleSubmit(payload) {
    if (editing) {
      await taskApi.update(editing.id, payload);
      push('Task updated');
    } else {
      await taskApi.create(payload);
      push('Task created');
    }
    setModalOpen(false);
    setEditing(null);
    loadTasks();
  }

  
  async function handleCreateEmployee(e) {
    e.preventDefault();
    setEmployeeSaving(true);

    try {
      const employee = await userApi.create({
        name: employeeName.trim(),
        email: employeeEmail.trim(),
        password: employeePassword,
      });

      setEmployees((prev) =>
        [...prev, employee].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      setEmployeeName('');
      setEmployeeEmail('');
      setEmployeePassword('');
      setEmployeeFormOpen(false);

      push('Employee created successfully');
    } catch (err) {
      push(err.response?.data?.message || err.message || 'Failed to create employee', 'error');
    } finally {
      setEmployeeSaving(false);
    }
  }

  async function loadEmployees() {
  try {
    const data = await userApi.list('employee');
    setEmployees(data);
  } catch (err) {
    push(err.message || 'Failed to load employees', 'error');
  }
}


async function handleEmployeeStatusChange(employee, is_active) {
  const action = is_active ? 'reactivate' : 'deactivate';

  const confirmed = window.confirm(
    `Are you sure you want to ${action} ${employee.name}'s account?`
  );

  if (!confirmed) return;

  try {
    await userApi.updateStatus(employee.id, is_active);

    await loadEmployees();

    push(
      `${employee.name}'s account ${is_active ? 'reactivated' : 'deactivated'} successfully`
    );
  } catch (err) {
    push(
      err.response?.data?.message ||
        err.message ||
        'Failed to update employee status',
      'error'
    );
  }
}



  async function handleStatusChange(task, newStatus) {
  if (task.status === newStatus) return;

  try {
    await taskApi.update(task.id, { status: newStatus });

    push(
      `"${task.title}" moved to ${newStatus.replace('_', ' ')}`
    );

    await loadTasks();
  } catch (err) {
    push(err.message || 'Failed to update task status', 'error');
  }
}

  return (
    <>
      <Navbar />
      <div className="container page">
        
      <header className="page-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="lede">Manage your team and assign work.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            onClick={() => setEmployeeFormOpen((open) => !open)}
          >
            + Add User
         </button>

          <button className="btn btn-primary" onClick={openCreate}>
            + New Task
          </button>
        </div>
      </header>

      {employeeFormOpen && (
        <div className="card card-pad" style={{ marginBottom: '1rem' }}>
          <div className="section-title">Add New Employee</div>

          <form onSubmit={handleCreateEmployee}>
            <div className="filters">
              <div className="field">
                <label htmlFor="employee-name">Full name</label>
                <input
                  id="employee-name"
                  className="input"
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Enter employee name"
                />
              </div>

              <div className="field">
                <label htmlFor="employee-email">Email</label>
                <input
                  id="employee-email"
                  className="input"
                  type="email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="employee@example.com"
                />
              </div>

              <div className="field">
                <label htmlFor="employee-password">Temporary password</label>
                <input
                  id="employee-password"
                  className="input"
                  type="password"
                  value={employeePassword}
                  onChange={(e) => setEmployeePassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={employeeSaving}
              >
                {employeeSaving ? 'Creating...' : 'Create Employee'}
              </button>

              <button
                className="btn"
                type="button"
                disabled={employeeSaving}
                onClick={() => setEmployeeFormOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}


        {error && <div className="error-banner">{error}</div>}

        {/* Stat tiles */}
        <div className="stats">
          <div className="card stat">
            <div className="n">{employees.length}</div>
            <div className="l">Employees</div>
            <div className="bar"><i style={{ width: '100%' }} /></div>
          </div>
          <div className="card stat">
            <div className="n">{total}</div>
            <div className="l">Total tasks</div>
            <div className="bar"><i style={{ width: '100%' }} /></div>
          </div>
          <div className="card stat">
            <div className="n">{summary.in_progress}</div>
            <div className="l">In progress (all tasks)</div>
            <div className="bar"><i style={{ width: '60%' }} /></div>
          </div>
          <div className="card stat">
            <div className="n">{summary.completed}</div>
            <div className="l">Completed (all tasks)</div>
            <div className="bar"><i style={{ width: '40%' }} /></div>
            
            <div className="card stat">
              <div className="n">
                {summary.total > 0
                  ? `${((Number(summary.completed) / Number(summary.total)) * 100).toFixed(1)}%`
                  : '0.0%'}
              </div>
              <div className="l">Task completion rate</div>
              <div className="bar">
                <i
                  style={{
                    width: `${
                      summary.total > 0
                        ? (Number(summary.completed) / Number(summary.total)) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

          </div>
        </div>

        
        <div className="card stat">
          <div className="n">{summary.overdue}</div>
          <div className="l">Overdue tasks</div>
          <div className="bar">
            <i
              style={{
                width: `${summary.total ? (summary.overdue / summary.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        
        {/* Task Status Analytics */}
        <div className="card card-pad" style={{ marginBottom: '1rem' }}>
          <div className="section-title">Task Status Analytics</div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[chartData.indexOf(entry)]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Workload Analytics */}
        <div className="card card-pad" style={{ marginBottom: '1rem' }}>
          <div className="section-title">Employee Workload</div>

          {employeeWorkload.length === 0 ? (
            <p className="muted">No employee workload data available.</p>
          ) : (
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={employeeWorkload}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="employee_name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" />
                  <Bar dataKey="in_progress" name="In Progress" fill="#3b82f6" />
                  <Bar dataKey="completed" name="Completed" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        
        {/* Team Management */}
        <div className="card card-pad" style={{ marginBottom: '1rem' }}>
          <div className="section-title">Team Management</div>

          {employees.length === 0 ? (
            <p className="muted">No employees found.</p>
          ) : (
            <div className="table-wrap">
              <table className="tasks">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Account Status</th>
                    <th className="right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>
                        {employee.is_active === false || employee.is_active === 0
                          ? 'Inactive'
                          : 'Active'}
                      </td>
                      <td className="right">
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                          const isInactive =
                            employee.is_active === false ||
                            employee.is_active === 0 ||
                            employee.is_active === '0';

                          handleEmployeeStatusChange(employee, isInactive);
                        }}
                        >
                          {employee.is_active === false || employee.is_active === 0
                            ? 'Reactivate'
                            : 'Deactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>




        {/* Kanban Board */}
        <div className="card card-pad" style={{ marginBottom: '1rem' }}>
          <div className="section-title">Team Kanban Board</div>

          <KanbanBoard
            tasks={tasks}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Filters */}
        <div className="card card-pad">
          <div className="section-title">All Tasks</div>
          <div className="filters">
            <div className="field">
              <label>Status</label>
              <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="field">
              <label>Due before</label>
              <input type="date" className="input" value={dueBefore} onChange={(e) => setDueBefore(e.target.value)} />
            </div>
            <div className="field">
              <label>Sort by</label>
              <select className="select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="created_at">Newest</option>
                <option value="due_date">Due date</option>
                <option value="status">Status</option>
                <option value="title">Title</option>
              </select>
            </div>
            {(statusFilter || dueBefore) && (
              <button
                className="btn btn-sm"
                onClick={() => {
                  setStatusFilter('');
                  setDueBefore('');
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="table-wrap">
            <table className="tasks">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assigned to</th>
                  <th>Status</th>
                  <th>Due date</th>
                  <th className="right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="center-screen" style={{ height: 120 }}>
                        <span className="spinner" /> Loading tasks…
                      </div>
                    </td>
                  </tr>
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty">
                        <div className="big">No tasks found</div>
                        <div>Try adjusting filters or create a new task.</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div className="task-title">{t.title}</div>
                        {t.description && <div className="task-desc">{t.description}</div>}
                      </td>
                      <td>{t.assignee_name || <span className="muted">Unassigned</span>}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>{t.due_date || <span className="muted">—</span>}</td>
                      <td className="right">
                        <button className="btn btn-sm" onClick={() => openEdit(t)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} limit={PAGE_SIZE} total={total} onChange={setPage} />
        </div>
      </div>

      {modalOpen && (
        <TaskModal
          task={editing}
          employees={employees}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}
