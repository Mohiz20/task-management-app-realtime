import { useEffect, useMemo, useState } from "react";
import useAxios from "../hooks/useAxios";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { useSocket } from "../context/SocketProvider";

export default function Tasks() {
  const { request, loading } = useAxios();
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [sort, setSort] = useState("date_desc");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, task: null });
  const [operationLoading, setOperationLoading] = useState({
    creating: false,
    updating: false,
    deleting: false,
    toggling: {}
  });
  const { socket } = useSocket();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tasks.filter((t) => {
      // Search in title, description, and categories
      let categories = []
      if (t.categories && Array.isArray(t.categories)) {
        categories = t.categories
      } else if (t.category) {
        categories = t.category.split(',').map(c => c.trim()).filter(Boolean)
      }
      const categoryMatch = categories.some(cat => cat.toLowerCase().includes(q))
      
      const matchQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        categoryMatch;
      const matchF =
        filter === "all" || (filter === "done" ? t.completed : !t.completed);
      return matchQ && matchF;
    });

    const byTitle = (a, b) => a.title.localeCompare(b.title);
    const byDate = (a, b) =>
      new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (sort === "title_asc") list.sort(byTitle);
    else if (sort === "title_desc") list.sort((a, b) => byTitle(b, a));
    else if (sort === "date_asc") list.sort(byDate);
    else list.sort((a, b) => byDate(b, a)); // date_desc default

    return list;
  }, [tasks, query, filter, sort]);

  async function load() {
     try {
      const { data } = await request({ url: "/tasks" });
      setTasks(data || []);
    } catch (e) {
      setToast({ 
        message: e?.response?.data?.message || "Failed to load tasks", 
        type: "error" 
      });
    }  }

  useEffect(() => {
    load();
  }, []);

  // Real-time events
  useEffect(() => {
    if (!socket) return;
    const upsert = (t) =>
      setTasks((curr) => {
        const i = curr.findIndex((x) => x.id === t.id);
        if (i >= 0) {
          const next = [...curr];
          next[i] = t;
          return next;
        }
        return [t, ...curr];
      });
    const remove = (id) => setTasks((curr) => curr.filter((x) => x.id !== id));

    socket.on("task_created", upsert);
    socket.on("task_updated", upsert);
    socket.on("task_deleted", ({ id }) => remove(id));
    return () => {
      socket.off("task_created", upsert);
      socket.off("task_updated", upsert);
      socket.off("task_deleted", remove);
    };
  }, [socket]);

  async function createTask(payload) {
    if (operationLoading.creating) return; // Prevent multiple clicks
    
    setOperationLoading(prev => ({ ...prev, creating: true }));
    try {
      await request({ method: "POST", url: "/tasks", data: payload });
      setToast({ 
        message: "Task created successfully! 🎉", 
        type: "success" 
      });
      setEditing(null);
      setShowForm(false); // Hide form after creation
      setFormKey(Date.now());
    } catch (e) {
      setToast({ 
        message: e?.response?.data?.message || "Failed to create task", 
        type: "error" 
      });
    } finally {
      setOperationLoading(prev => ({ ...prev, creating: false }));
    }
  }

  async function updateTask(id, payload, isToggle = false) {
    if (operationLoading.updating && !isToggle) return; // Prevent multiple clicks for form updates
    
    if (!isToggle) {
      setOperationLoading(prev => ({ ...prev, updating: true }));
    }
    
    try {
      const { data } = await request({
        method: "PUT",
        url: `/tasks/${id}`,
        data: payload,
      });
      
      if (!isToggle) {
        setToast({ 
          message: "Task updated successfully! ✨", 
          type: "success" 
        });
        setEditing(null);
        setShowForm(false); // Hide form after update
      } else {
        // For toggle operations, show completion status
        const status = payload.completed ? "completed" : "reopened";
        setToast({ 
          message: `Task ${status} successfully! ${payload.completed ? '✅' : '🔄'}`, 
          type: "success" 
        });
      }
      
      setTasks((curr) => curr.map((t) => (t.id === id ? data : t)));
    } catch (e) {
      setToast({ 
        message: e?.response?.data?.message || "Failed to update task", 
        type: "error" 
      });
    } finally {
      if (!isToggle) {
        setOperationLoading(prev => ({ ...prev, updating: false }));
      }
    }
  }

  async function toggleTask(t) {
    if (operationLoading.toggling[t.id]) return; // Prevent multiple clicks
    
    setOperationLoading(prev => ({ 
      ...prev, 
      toggling: { ...prev.toggling, [t.id]: true }
    }));
    
    try {
      await updateTask(t.id, { completed: !t.completed }, true);
    } catch (e) {
      setToast({ 
        message: e?.response?.data?.message || "Failed to toggle task status", 
        type: "error" 
      });
    } finally {
      setOperationLoading(prev => ({ 
        ...prev, 
        toggling: { ...prev.toggling, [t.id]: false }
      }));
    }
  }

  async function deleteTask(t) {
    setDeleteModal({ isOpen: true, task: t });
  }

  async function confirmDelete() {
    if (!deleteModal.task || operationLoading.deleting) return;
    
    setOperationLoading(prev => ({ ...prev, deleting: true }));
    try {
      await request({ method: "DELETE", url: `/tasks/${deleteModal.task.id}` });
      setToast({ 
        message: "Task deleted successfully! 🗑️", 
        type: "success" 
      });
      setTasks((curr) => curr.filter((x) => x.id !== deleteModal.task.id));
    } catch (e) {
      setToast({ 
        message: e?.response?.data?.message || "Failed to delete task", 
        type: "error" 
      });
    } finally {
      setOperationLoading(prev => ({ ...prev, deleting: false }));
      setDeleteModal({ isOpen: false, task: null });
    }
  }

  function cancelDelete() {
    setDeleteModal({ isOpen: false, task: null });
  }

  function handleAddTask() {
    setEditing(null);
    setShowForm(true);
  }

  function handleEditTask(task) {
    setEditing(task);
    setShowForm(true);
  }

  function handleCancelForm() {
    setEditing(null);
    setShowForm(false);
  }

  // Determine if form should be visible
  const isFormVisible = showForm || editing;

  return (
    <div style={{ maxWidth: 720, margin: "16px auto", padding: "0 12px" }}>
      {/* Controls */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--text)",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease"
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--text)",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease"
          }}
        >
          <option value="all">All</option>
          <option value="todo">Todo</option>
          <option value="done">Done</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            padding: "10px 12px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            color: "var(--text)",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease"
          }}
        >
          <option value="date_desc">Date (new → old)</option>
          <option value="date_asc">Date (old → new)</option>
          <option value="title_asc">Title (A → Z)</option>
          <option value="title_desc">Title (Z → A)</option>
        </select>
      </div>

      {/* Add Task Button or Form Panel */}
      {!isFormVisible ? (
        <button
          onClick={handleAddTask}
          style={{
            width: "100%",
            padding: "16px",
            background: "var(--primary)",
            color: "var(--bg)",
            border: "1px solid var(--primary)",
            borderRadius: 14,
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: 12,
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
          className="appear button"
        >
          <span>➕</span> Add New Task
        </button>
      ) : (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 12,
            marginBottom: 12,
          }}
          className="appear"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--text)" }}>
              {editing ? "Edit task" : "Add new task"}
            </div>
            <button
              onClick={handleCancelForm}
              style={{
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--muted)",
                padding: "8px 12px",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "14px"
              }}
              className="button"
            >
              ✕ Close
            </button>
          </div>
          <TaskForm
            key={editing ? editing.id : formKey}
            initial={editing}
            onCancel={handleCancelForm}
            onSubmit={(payload) =>
              editing ? updateTask(editing.id, payload) : createTask(payload)
            }
            isLoading={editing ? operationLoading.updating : operationLoading.creating}
          />
        </div>
      )}

      {/* List */}
      {loading && !tasks.length ? <Loader /> : null}
      {!loading && !filtered.length ? (
        <EmptyState
          title="No tasks yet"
          subtitle="Add your first task above."
        />
      ) : null}

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            onToggle={toggleTask}
            onEdit={handleEditTask}
            onDelete={deleteTask}
            isToggling={operationLoading.toggling[t.id]}
          />
        ))}
      </div>

      <Toast 
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })} 
      />
      
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        taskTitle={deleteModal.task?.title}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={operationLoading.deleting}
      />
    </div>
  );
}
