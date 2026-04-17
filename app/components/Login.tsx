import React, { useState } from "react";

type CurrentUser = {
  id: number;
  email: string;
  username: string;
};

type LoginFormProps = {
  currentUser: CurrentUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>;
};

type ApiError = {
  error?: string;
};

const API_BASE_URL = "http://localhost:3001";

const hasApiError = (value: unknown): value is ApiError => {
  return typeof value === "object" && value !== null && "error" in value;
};

const isCurrentUser = (value: unknown): value is CurrentUser => {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value &&
    "username" in value
  );
};

export const LoginForm = ({
  currentUser,
  setCurrentUser,
}: LoginFormProps) => {
  const [loginValues, setLoginValue] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setLoginValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify(loginValues),
      });

      const data: unknown = await response.json();

      if (!response.ok || (hasApiError(data) && data.error)) {
        setMessage((hasApiError(data) && data.error) || "Login failed");
        setCurrentUser(null);
        return;
      }

      if (!isCurrentUser(data)) {
        throw new Error("Invalid login response");
      }

      setCurrentUser(data);
      setMessage(`Welcome back, ${data.username}`);
    } catch {
      setMessage("Login failed");
      setCurrentUser(null);
    }
  };

  const handleCheckUser = async () => {
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      const data: unknown = await response.json();

      if (!response.ok || (hasApiError(data) && data.error)) {
        setMessage((hasApiError(data) && data.error) || "No active session");
        setCurrentUser(null);
        return;
      }

      if (!isCurrentUser(data)) {
        throw new Error("Invalid session response");
      }

      setCurrentUser(data);
      setMessage(`Session active for ${data.username}`);
    } catch {
      setMessage("Unable to check session");
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      setCurrentUser(null);
      setMessage("Logged out");
    } catch {
      setMessage("Logout failed");
    }
  };

  return (
    <div className="rounded-lg border border-[#d8dde8] bg-white p-5 shadow-md shadow-[#64748b]/10">
      {!currentUser && (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#e11d48]">
                Returning user
              </p>
              <span className="rounded-md bg-[#fff1f2] px-2.5 py-1 text-xs font-bold text-[#be123c]">
                Step 2
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#111827]">Login</h2>
            <p className="mt-1 text-sm leading-6 text-[#64748b]">
              Sign in and let the backend send the session cookie back.
            </p>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#374151]">
            Email
            <input
              className="h-12 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[#111827] outline-none transition focus:border-[#e11d48] focus:bg-white focus:ring-2 focus:ring-[#fecdd3]"
              name="email"
              type="email"
              value={loginValues.email}
              onChange={handleChange}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-[#374151]">
            Password
            <input
              className="h-12 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[#111827] outline-none transition focus:border-[#e11d48] focus:bg-white focus:ring-2 focus:ring-[#fecdd3]"
              name="password"
              type="password"
              value={loginValues.password}
              onChange={handleChange}
            />
          </label>

          <button
            className="h-12 rounded-md bg-[#e11d48] px-4 text-sm font-bold text-white shadow-sm shadow-[#e11d48]/25 transition hover:bg-[#be123c]"
            type="submit"
          >
            Sign in
          </button>
        </form>
      )}

      {currentUser && (
        <div>
          <p className="text-sm font-semibold text-[#e11d48]">Session</p>
          <h2 className="mt-2 text-2xl font-bold text-[#111827]">Signed in</h2>
          <p className="mt-1 text-sm leading-6 text-[#64748b]">
            Check the cookie-backed session or log out when you are done.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <button
          className="h-11 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-4 text-sm font-bold text-[#111827] transition hover:border-[#64748b] hover:bg-white"
          onClick={handleCheckUser}
          type="button"
        >
          Check User
        </button>
        <button
          className="h-11 rounded-md border border-[#fecdd3] bg-[#fff1f2] px-4 text-sm font-bold text-[#be123c] transition hover:bg-[#ffe4e6]"
          onClick={handleLogout}
          type="button"
        >
          Logout
        </button>
      </div>

      {(message || currentUser) && (
        <div className="mt-4 rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-3 py-3 text-sm text-[#334155]">
          {currentUser && (
            <p className="font-bold text-[#111827]">
              Logged in as: {currentUser.username}
            </p>
          )}
          {message && <p className="mt-1">{message}</p>}
        </div>
      )}
    </div>
  );
};
