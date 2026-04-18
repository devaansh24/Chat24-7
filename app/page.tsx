"use client";

import { Register } from "./components/Register";
import { LoginForm } from "./components/Login";
import { useEffect, useState } from "react";
import { ChatRooms } from "./components/Rooms";
import Image from "next/image";

type CurrentUser = {
  id: number;
  email: string;
  username: string;
};

export default function Home() {

  useEffect(()=>{
      fetch("http://localhost:3001/api/auth/me",{
        credentials:"include"
      }).then((response)=>response.json())
      .then((data)=>{
        if(data.error){
          setCurrentUser(null);
          return
        }
        setCurrentUser(data)
      }).catch(()=>{
        setCurrentUser(null)
      })
  },[])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);


  

  return (
    <main className="min-h-screen bg-[#eef2f1] px-4 py-6 text-[#171717] sm:px-6 lg:px-10">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="relative min-h-80 overflow-hidden rounded-lg bg-[#173b35] shadow-xl shadow-[#173b35]/20 lg:min-h-full">
          <Image
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
            alt="Desk with an open laptop"
            className="h-full min-h-80 w-full object-cover opacity-80"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-[#12312c]/45" />
          <div className="absolute left-5 top-5 rounded-md border border-white/25 bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
            Express + Next.js
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9ae6b4]">
              Auth Workspace
            </p>
            <h1 className="mt-3 max-w-md text-4xl font-bold leading-tight">
              Build the login loop with rooms ready behind it.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/85">
              Register, sign in, confirm the session, create a room, then keep moving toward messages.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 rounded-lg border border-white bg-white/80 p-5 shadow-xl shadow-[#64748b]/10 sm:p-8">
          <div>
            <p className="text-sm font-semibold text-[#0f766e]">Local backend</p>
            <h2 className="mt-2 text-3xl font-bold text-[#111827]">Account Access</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6472]">
              Use the forms below to test your Express auth routes from the browser.
            </p>
          </div>

          {currentUser ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 rounded-lg border border-[#cfe0da] bg-[#f5fbf8] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#0f766e]">Signed in</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#111827]">
                    Welcome, {currentUser.username}
                  </h2>
                  <p className="mt-2 text-sm text-[#5b6472]">
                    {currentUser.email}
                  </p>
                </div>
                <div className="rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#173b35] shadow-sm">
                  User #{currentUser.id}
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                <LoginForm
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                />
                <ChatRooms
                  currentUser={currentUser}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              <Register />
              <LoginForm
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
