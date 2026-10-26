
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';

import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';


const COLUMNS = [
  { id: 'pending', title: 'Pending' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
];

function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(task.id),
    data: {
      status: task.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="card card-pad"
      {...attributes}
      {...listeners}
    >
      <strong>{task.title}</strong>

      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      <div className="muted">
        Due: {task.due_date || 'No due date'}
      </div>
    </article>
  );
}

export default function KanbanBoard({ tasks, onStatusChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return;

    const task = tasks.find(
      (item) => String(item.id) === String(active.id)
    );

    if (!task) return;

    const targetTask = tasks.find(
      (item) => String(item.id) === String(over.id)
    );

    const targetStatus =
      COLUMNS.some((column) => column.id === over.id)
        ? over.id
        : targetTask?.status;

    if (targetStatus && targetStatus !== task.status) {
      onStatusChange(task, targetStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.id
          );

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
            />
          );
        })}
      </div>
    </DndContext>
  );
}

function KanbanColumn({ column, tasks }) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { status: column.id },
  });

  return (
    <section className="kanban-column">
      <h2>
        {column.title} <span>({tasks.length})</span>
      </h2>

      <SortableContext
        items={tasks.map((task) => String(task.id))}
        strategy={verticalListSortingStrategy}
      >
        <div ref={setNodeRef} className="kanban-column-body">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {tasks.length === 0 && (
            <p className="muted">No tasks here</p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
