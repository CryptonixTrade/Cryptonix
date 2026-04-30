"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function UsersAdmin() {
  const { data: session, status } = useSession();

  const [users, setUsers] = useState<any[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 👇 добавили сюда (а не вне компонента)
  const [newPasswords, setNewPasswords] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (session?.user?.role === "admin") {
      loadUsers();
    }
  }, [session]);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  async function createUser() {
    await fetch("/api/admin/create-user", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        role: "user",
      }),
    });

    setUsername("");
    setPassword("");
    loadUsers();
  }

  async function deleteUser(id: string) {
    await fetch("/api/admin/delete-user", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    loadUsers();
  }

  // 👇 тоже внутрь компонента
  async function changePassword(id: string) {
    const newPassword = newPasswords[id];

    if (!newPassword) {
      alert("Введите новый пароль");
      return;
    }

    await fetch("/api/admin/change-password", {
      method: "POST",
      body: JSON.stringify({ id, newPassword }),
    });

    alert("Пароль обновлен");

    setNewPasswords({ ...newPasswords, [id]: "" });
  }

  if (status === "loading") return <div>Loading...</div>;

  if (!session) return <div>⛔ Не авторизован</div>;

  if (session.user.role !== "admin") {
    return <div>⛔ Нет доступа</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>👑 Admin Users</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={createUser}>Create</button>
      </div>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.username} — {u.role}

            <button
              onClick={() => deleteUser(u.id)}
              style={{ marginLeft: 10, color: "red" }}
            >
              Delete
            </button>

            {/* 👇 смена пароля */}
            <input
              placeholder="new password"
              value={newPasswords[u.id] || ""}
              onChange={(e) =>
                setNewPasswords({
                  ...newPasswords,
                  [u.id]: e.target.value,
                })
              }
              style={{ marginLeft: 10 }}
            />

            <button
              onClick={() => changePassword(u.id)}
              style={{ marginLeft: 5 }}
            >
              Change
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}