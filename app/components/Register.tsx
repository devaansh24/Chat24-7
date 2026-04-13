import React, { useState } from "react";

export const Register = () => {
  const [formValue, setFormValues] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const postData = {
      email: formValue.email,
      username: formValue.username,
      password: formValue.password,
    };
    console.log(postData, "postdata");

    fetch("http://localhost:3001/api/auth/register", {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setMessage(data.error);
          return;
        }

        setMessage(`Registered ${data.username}`);
      });
  };

  return (
    <div className="rounded-lg border border-[#d8dde8] bg-white p-5 shadow-md shadow-[#64748b]/10">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#0f766e]">New account</p>
            <span className="rounded-md bg-[#ecfdf5] px-2.5 py-1 text-xs font-bold text-[#047857]">
              Step 1
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-[#111827]">Register</h2>
          <p className="mt-1 text-sm leading-6 text-[#64748b]">
            Create a test user and store the auth cookie in the browser.
          </p>
        </div>
        <label className="flex flex-col gap-2 text-sm font-medium text-[#374151]">
          Email
          <input
            className="h-12 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[#111827] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#99f6e4]"
            name="email"
            type="email"
            value={formValue.email}
            onChange={handleChange}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-[#374151]">
          Username
          <input
            className="h-12 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[#111827] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#99f6e4]"
            name="username"
            value={formValue.username}
            onChange={handleChange}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-[#374151]">
          Password
          <input
            className="h-12 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[#111827] outline-none transition focus:border-[#0f766e] focus:bg-white focus:ring-2 focus:ring-[#99f6e4]"
            name="password"
            type="password"
            value={formValue.password}
            onChange={handleChange}
          />
        </label>
        <button
          className="h-12 rounded-md bg-[#0f766e] px-4 text-sm font-bold text-white shadow-sm shadow-[#0f766e]/25 transition hover:bg-[#115e59]"
          type="submit"
        >
          Create account
        </button>
        {message && (
          <p className="rounded-md border border-[#bbf7d0] bg-[#ecfdf5] px-3 py-2 text-sm font-medium text-[#065f46]">
            {message}
          </p>
        )}
      </form>
    </div>
  );
};
