"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.SyntheticEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      alert("Invalid email or password");
      return;
    }

    const data = await res.json();
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user.role === "Manager") {
      window.location.href = "/manager";
    } else {
      window.location.href = "/employee";
    }
  } catch (error) {
    alert("Could not connect to server. Is the backend running?");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-screen-xl px-8 grid gap-8 grid-cols-1 md:grid-cols-2 md:px-12 lg:px-16 xl:px-32 mx-auto bg-gray-100 text-gray-900 rounded-lg shadow-lg min-h-[80vh]">
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="mt-10 text-4xl font-bold leading-tight">
              Welcome to LeaveHub!
            </h2>
            <p className="text-gray-700 mt-8">
              Manage your time-off requests with ease. Submit leave requests,
              track your balances, and stay on top of your schedule.
            </p>
          </div>
          <div className="mt-8 text-center">
            <Image
              src="/loginImage.jpg"
              alt="LeaveHub illustration"
              width={500}
              height={500}
              className="w-full rounded-lg"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <form onSubmit={handleLogin} className="flex flex-col justify-between h-full py-8">
            <div className="flex-1 flex flex-col justify-center space-y-10">
              <div>
                <span className="uppercase text-sm text-gray-600 font-bold">
                  Email
                </span>
                <input
                  className="w-full bg-gray-300 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <span className="uppercase text-sm text-gray-600 font-bold">
                  Password
                </span>
                <div className="relative">
                  <input
                    className="w-full bg-gray-300 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline pr-12"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 translate-y-[-30%] text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="uppercase text-sm font-bold tracking-wide bg-indigo-500 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline hover:bg-indigo-600 transition-colors"
                >
                  Log In
                </button>
                <div className="mt-4 text-center">
                  <a
                    href="#"
                    className="text-sm text-indigo-500 hover:text-indigo-600"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-xs text-gray-500">
                This portal is for authorized employees only. Your login
                credentials are provided by your administrator. If you have not
                received your username and password, please contact your manager
                or IT department.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}