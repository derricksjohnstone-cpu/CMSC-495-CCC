"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.SyntheticEvent) => {
    e.preventDefault();
    // Wait for the backend login API
      alert("Login functionality is not implemented yet.");
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
                <input
                  className="w-full bg-gray-300 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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