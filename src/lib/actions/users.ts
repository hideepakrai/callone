"use server";

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/db/connection";
import { Role } from "@/lib/db/models/Role";
import { User } from "@/lib/db/models/User";
import { toast } from "sonner";

function parseObjectIds(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .map((value) => String(value))
    .filter(Boolean);
}

export async function saveUserInternal(payload: any) {
  await dbConnect();
  
  const id = payload.id;
  delete payload.id; // Remove id from payload if it exists

  if (payload.roleId) {
    const role = await Role.findById(payload.roleId);
    if (!role) {
      throw new Error("Invalid role selected.");
    }
    payload.role = role.name;
    payload.roleKey = role.key;
  }

  if (payload.manager_id) {
    if (mongoose.Types.ObjectId.isValid(payload.manager_id)) {
      // It's a valid ObjectId, find the manager to sync manager_id and managerId
      const manager = await User.findById(payload.manager_id);
      if (manager) {
        payload.managerId = manager._id;
        payload.manager_id = manager.id || manager.manager_id;
      }
    } else {
      // It's likely a legacy numeric ID (like "103")
      payload.manager_id = Number(payload.manager_id);
      
      // Try to find the user with this legacy ID to set managerId correctly
      const manager = await User.findOne({ 
        $or: [{ id: payload.manager_id }, { legacyId: payload.manager_id }] 
      });
      if (manager) {
        payload.managerId = manager._id;
      } else {
        payload.managerId = null;
      }
    }
  } else {
    payload.managerId = null;
    payload.manager_id = null;
  }

  if (payload.password) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    payload.passwordHash = hashedPassword;
    payload.password_hash = payload.password;
    payload.new_hash_password = hashedPassword;
    delete payload.password;
  }

  try {
    if (id) {
      const res = await User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
      return {
        success: true,
        user: JSON.parse(JSON.stringify(res)),
        isEdit: true,
      };
    } else {
      if (!payload.passwordHash) {
        throw new Error("Password is required for new users.");
      }

      const res = await User.create(payload);
      return {
        success: true,
        user: JSON.parse(JSON.stringify(res)),
        isEdit: false,
      };
    }
  } catch (error: any) {
    throw error;
  }
}

export async function saveUser(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleId = String(formData.get("roleId") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!name || !email || !roleId) {
    throw new Error("Name, email, and role are required.");
  }

  const payload: any = {
    id,
    name,
    email,
    roleId,
    password,
    phone: String(formData.get("phone") ?? "").trim(),
    phone2: String(formData.get("phone2") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim(),
    designation: String(formData.get("designation") ?? "").trim(),
    manager_id: String(formData.get("manager_id") ?? "").trim() || null,
    gstin: String(formData.get("gstin") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    secondaryEmail: String(formData.get("secondaryEmail") ?? "").trim(),
    assignedBrandIds: parseObjectIds(formData, "assignedBrandIds"),
    assignedWarehouseIds: parseObjectIds(formData, "assignedWarehouseIds"),
    status: formData.get("status") === "inactive" ? "inactive" : "active",
  };

  try {
    const result = await saveUserInternal(payload);
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "An error occurred while saving the user.",
    };
  }
}

export async function deleteUserInternal(id: string) {
  await dbConnect();
  await User.findByIdAndDelete(id);
  return { success: true };
}

export async function deleteUser(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();

 const res = await deleteUserInternal(id);
 if(res){
 toast.success("User deleted successfully");

 }
  
}

export async function getUsersByRole(role: string) {
  await dbConnect();
  return User.find({ role, status: "active" }).select("_id name email managerId").lean();
}
