import React, { useState } from "react";

type LoginFormProps={
    currentUser:CurrentUser | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<CurrentUser | null>>
}
type CurrentUser={
  id:number;
  email:string;
  username:string;
}

export const LoginForm=({currentUser,setCurrentUser}:LoginFormProps)=>{
    const[loginValues,setLoginValue]=useState({
        email:'',
        password:''
    })

    const[message,setMessage]=useState('')

    const handleChange=(e:any)=>{
        const {name,value}=e.target

        setLoginValue((prev)=>({
            ...prev,
            [name]:value
        }))

    }

    const handleSubmit=(e:any)=>{
        e.preventDefault();

        const postData={
            email:loginValues.email,
            password:loginValues.password
        }

        fetch('http://localhost:3001/api/auth/login',{
            credentials:'include',
            headers:{'Content-Type':'application/json'},
            method:'POST',
            body:JSON.stringify(postData)
            
        }).then(response=>response.json())
        .then(data=>{
            if(data.error){
                setMessage(data.error)
                setCurrentUser(null)
                return;
            }

            setCurrentUser(data)
            setMessage(`Welcome back, ${data.username}`)
        })
    }

    const handleClick=()=>{
        fetch('http://localhost:3001/api/auth/me',{
            method:"GET",
            credentials:'include'

        }).then(response=>response.json()).then(data=>{
            if(data.error){
                setMessage(data.error)
                setCurrentUser(null)
                return;
            }

            setCurrentUser(data)
            setMessage(`Session active for ${data.username}`)
        })
    }
    const handleLogout=()=>{
        fetch('http://localhost:3001/api/auth/logout',{
            method:'POST',
            credentials:'include'
        }).then(response=>response.json()).then(()=>{
            setCurrentUser(null)
            setMessage('Logged out')
        })
    }
    return(
        <div className="rounded-lg border border-[#d8dde8] bg-white p-5 shadow-md shadow-[#64748b]/10">
        {!currentUser && (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>

            <div>
            <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#e11d48]">Returning user</p>
            <span className="rounded-md bg-[#fff1f2] px-2.5 py-1 text-xs font-bold text-[#be123c]">
                Step 2
            </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-[#111827]">Login</h2>
            <p className="mt-1 text-sm leading-6 text-[#64748b]">
                Sign in and let the backend send the session cookie back.
            </p>
            </div>
            <label className="flex flex-col gap-2 text-sm font-medium text-[#374151]">Email
            <input className="h-12 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[#111827] outline-none transition focus:border-[#e11d48] focus:bg-white focus:ring-2 focus:ring-[#fecdd3]" name="email" type="email" value={loginValues.email}onChange={handleChange}/>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[#374151]">Password
            <input className="h-12 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 text-[#111827] outline-none transition focus:border-[#e11d48] focus:bg-white focus:ring-2 focus:ring-[#fecdd3]" name="password" type="password" value={loginValues.password} onChange={handleChange} />
            </label>
            <button className="h-12 rounded-md bg-[#e11d48] px-4 text-sm font-bold text-white shadow-sm shadow-[#e11d48]/25 transition hover:bg-[#be123c]" type="submit">Sign in</button>
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
        <button className="h-11 rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-4 text-sm font-bold text-[#111827] transition hover:border-[#64748b] hover:bg-white" onClick={handleClick}>Check User</button>
        <button className="h-11 rounded-md border border-[#fecdd3] bg-[#fff1f2] px-4 text-sm font-bold text-[#be123c] transition hover:bg-[#ffe4e6]" onClick={handleLogout}>Logout</button>
        </div>

        {(message || currentUser) && (
            <div className="mt-4 rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-3 py-3 text-sm text-[#334155]">
            {currentUser && <p className="font-bold text-[#111827]">Logged in as: {currentUser.username}</p>}
            {message && <p className="mt-1">{message}</p>}
            </div>
        )}
        </div>
    )
}
