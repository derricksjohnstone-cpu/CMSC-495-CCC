"use client";

import { useState, useEffect, useRef } from "react";
import Avatar from "@/components/ui/Avatar";
import Header from "@/components/layout/Header";

export default function SettingsPage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    profileImage: null as string | null,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [imageMessage, setImageMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser({
        name: parsed.name,
        email: parsed.email,
        department: parsed.department,
        role: parsed.role || "Employee",
        profileImage: parsed.profileImage,
      });
    }
  }, []);

  const handlePasswordChange = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }

    console.log("Password change requested:", { currentPassword, newPassword });
    setPasswordMessage("Password change is not available yet. Backend endpoint coming soon.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageMessage("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageMessage("Image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.profileImage = base64;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
      setUser((prev) => ({ ...prev, profileImage: base64 }));
      setImageMessage("Profile picture updated! Refresh to see changes in the sidebar.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.profileImage = null;
      localStorage.setItem("user", JSON.stringify(parsed));
    }
    setUser((prev) => ({ ...prev, profileImage: null }));
    setImageMessage("Profile picture removed.");
  };

  return (
    <div>
      <div className="md:hidden">
        <Header />
      </div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile and account preferences.
        </p>
      </div>

      <div className="space-y-6">

        {/* Profile Picture */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
          <div className="flex items-center gap-6">
            <Avatar name={user.name || "User"} profileImage={user.profileImage} size="lg" />
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-full bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
                >
                  Upload Photo
                </button>
                {user.profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400">JPG, PNG or GIF. Max 2MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {imageMessage && (
            <p className="text-sm text-indigo-600 mt-3">{imageMessage}</p>
          )}
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
              <p className="bg-gray-100 text-gray-900 p-3 rounded-xl text-sm">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="bg-gray-100 text-gray-900 p-3 rounded-xl text-sm">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Department</label>
              <p className="bg-gray-100 text-gray-900 p-3 rounded-xl text-sm">{user.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
              <p className="bg-gray-100 text-gray-900 p-3 rounded-xl text-sm">{user.role}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Profile information is managed by your administrator. Contact IT to request changes.
          </p>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full bg-gray-100 text-gray-900 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">New Password</label>
              <input
                type="password"
                className="w-full bg-gray-100 text-gray-900 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Confirm New Password</label>
              <input
                type="password"
                className="w-full bg-gray-100 text-gray-900 p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm ${passwordMessage.includes("not") || passwordMessage.includes("must") ? "text-red-500" : "text-indigo-600"}`}>
                {passwordMessage}
              </p>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Logout</h3>
          <p className="text-sm text-gray-500 mb-4">Sign out of your account on this device.</p>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="px-6 py-2.5 rounded-full border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}