import { useEffect, useMemo, useState } from "react";
import useAxios from "../hooks/useAxios";
import TaskCard from "../components/TaskCard";
import TaskForm from "../components/TaskForm";
import Toast from "../components/Toast";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { useSocket } from "../context/SocketProvider";

export default function Tasks() {
  const { request, loading } = useAxios();
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [formKey, setFormKey] = useState(0);

  const { socket } = useSocket();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q);
      const matchF =
        filter === "all" || (filter === "done" ? t.completed : !t.completed);
      return matchQ && matchF;
    });
  }, [tasks, query, filter]);

  async function load() {
    try {
      const { data } = await request({ url: "/tasks" });
      setTasks(data || []);
    } catch (e) {
      setToast(e?.response?.data?.message || "Failed to load tasks");
    }
  }

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
    try {
      await request({ method: "POST", url: "/tasks", data: payload });
      setToast("Task created");
      setEditing(null);
      setFormKey(Date.now());
    } catch (e) {
      setToast(e?.response?.data?.message || "Failed to create task");
    }
  }

  async function updateTask(id, payload) {
    try {
      const { data } = await request({
        method: "PUT",
        url: `/tasks/${id}`,
        data: payload,
      });
      setToast("Task updated");
      setEditing(null);
      setTasks((curr) => curr.map((t) => (t.id === id ? data : t)));
    } catch (e) {
      setToast(e?.response?.data?.message || "Failed to update task");
    }
  }

  async function toggleTask(t) {
    try {
      await updateTask(t.id, { completed: !t.completed });
    } catch (e) {
      setToast(e?.response?.data?.message || "Failed to toggle task");
    }
  }

  async function deleteTask(t) {
    if (!confirm("Delete this task?")) return;
    try {
      await request({ method: "DELETE", url: `/tasks/${t.id}` });
      setToast("Task deleted");
      setTasks((curr) => curr.filter((x) => x.id !== t.id));
    } catch (e) {
      setToast(e?.response?.data?.message || "Failed to delete task");
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "16px auto", padding: "0 12px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
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
            background: "#0b0f14",
            border: "1px solid #233244",
            borderRadius: 10,
            color: "var(--text)",
          }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "10px 12px",
            background: "#0b0f14",
            border: "1px solid #233244",
            borderRadius: 10,
            color: "var(--text)",
          }}
        >
          <option value="all">All</option>
          <option value="todo">Todo</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Create / Edit Panel */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid #1f2a36",
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
          <div style={{ fontWeight: 700 }}>
            {editing ? "Edit task" : "Add task"}
          </div>
          {editing ? (
            <button
              onClick={() => setEditing(null)}
              style={{
                border: "1px solid #233244",
                background: "#121821",
                color: "var(--text)",
                padding: "6px 10px",
                borderRadius: 8,
              }}
            >
              New
            </button>
          ) : null}
        </div>
        <TaskForm
          key={editing ? editing.id : formKey}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(payload) =>
            editing ? updateTask(editing.id, payload) : createTask(payload)
          }
        />
      </div>

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
            onEdit={setEditing}
            onDelete={deleteTask}
          />
        ))}
      </div>

      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}
