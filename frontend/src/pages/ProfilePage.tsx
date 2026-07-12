import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { profileApi } from "../api/profile.api";
import { Avatar } from "../components/common/Avatar";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { ROLE_LABELS } from "../config/permissions";
import { toast } from "sonner";
import { Camera, Trash2, Key, User, Briefcase, Phone, Mail, ShieldAlert } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Edit Profile Form
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [designation, setDesignation] = useState(user?.designation || "");

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Photo Upload Preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sync state if user context updates from other sources
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setDepartment(user.department || "");
      setDesignation(user.designation || "");
    }
  }, [user]);

  // Clean up preview URL memory leak
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle Photo Select
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation checks
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file format. Please upload JPG, PNG, or WEBP.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      toast.error("File is too large. Maximum size allowed is 5 MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Upload Selected Photo
  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      setPhotoLoading(true);
      const res = await profileApi.uploadPhoto(formData);
      const updatedUser = res.data?.data;
      updateUser({ profileImage: updatedUser.profileImage });
      toast.success("Profile photo updated successfully!");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  // Cancel selected photo
  const handleCancelPhoto = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Remove current Photo
  const handleRemovePhoto = async () => {
    try {
      setPhotoLoading(true);
      await profileApi.deletePhoto();
      updateUser({ profileImage: null });
      toast.success("Profile photo removed successfully!");
      handleCancelPhoto();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  // Save profile info changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    try {
      setProfileLoading(true);
      const res = await profileApi.updateProfile({
        name,
        phone: phone || null,
        department: department || null,
        designation: designation || null
      });
      const updatedUser = res.data?.data;
      updateUser({
        name: updatedUser.name,
        phone: updatedUser.phone,
        department: updatedUser.department,
        designation: updatedUser.designation
      });
      toast.success("Profile details updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save profile changes.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password changes
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Confirm password does not match the new password.");
      return;
    }

    try {
      setPasswordLoading(true);
      await profileApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <Breadcrumb items={[{ label: "User Profile" }]} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update your personal details, workspace descriptors, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar and Info Card */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="rounded-2xl border border-white/5 bg-card text-card-foreground shadow-xl p-6 glass flex flex-col items-center text-center">
            <div className="relative group">
              <Avatar
                name={user?.name}
                src={previewUrl || user?.profileImage}
                size="xxl"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/95 transition-all"
                title="Change Photo"
                disabled={photoLoading}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoSelect}
              />
            </div>

            {/* Photo Action Helpers */}
            {previewUrl ? (
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="premium" onClick={handleUploadPhoto} isLoading={photoLoading}>
                  Confirm
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelPhoto} disabled={photoLoading}>
                  Cancel
                </Button>
              </div>
            ) : (
              user?.profileImage && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 text-destructive hover:bg-destructive/10"
                  onClick={handleRemovePhoto}
                  isLoading={photoLoading}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remove Photo
                </Button>
              )
            )}

            <h2 className="text-xl font-bold mt-6 truncate w-full">{user?.name}</h2>
            <p className="text-sm text-muted-foreground truncate w-full flex items-center justify-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            {user?.role && (
              <span className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {ROLE_LABELS[user.role]}
              </span>
            )}
          </div>
        </div>

        {/* Profile and Password details cards */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Edit Info Form */}
          <div className="rounded-2xl border border-white/5 bg-card text-card-foreground shadow-xl p-6 glass">
            <h3 className="text-lg font-semibold border-b border-white/5 pb-3 mb-4 flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" />
              Profile Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rajesh Kumar" required disabled={profileLoading} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +91 98765 43210" disabled={profileLoading} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium mb-1.5 block">Department</label>
                  <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g. Logistics" disabled={profileLoading} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium mb-1.5 block">Designation</label>
                  <Input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. Fleet Coordinator" disabled={profileLoading} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="premium" isLoading={profileLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div id="password" className="rounded-2xl border border-white/5 bg-card text-card-foreground shadow-xl p-6 glass">
            <h3 className="text-lg font-semibold border-b border-white/5 pb-3 mb-4 flex items-center gap-2 text-foreground">
              <Key className="w-5 h-5 text-rose-500" />
              Change Password
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                  <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" required disabled={passwordLoading} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">New Password (min 8)</label>
                  <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required disabled={passwordLoading} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Confirm New Password</label>
                  <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required disabled={passwordLoading} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="destructive" isLoading={passwordLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
