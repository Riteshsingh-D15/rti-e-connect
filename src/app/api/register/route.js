import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  addAuditLog,
  addNotification,
  addUser,
  getUserByEmail,
} from "@/lib/data-store";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone = "",
      state = "",
      district = "",
      address = "",
    } = body;

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email.trim());
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Security: public registration strictly creates CITIZEN accounts only
    const user = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: "CITIZEN",
      phone: String(phone).trim(),
      state: String(state).trim(),
      district: String(district).trim(),
      address: String(address).trim(),
      preferredLanguage: "English",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addUser(user);

    await addAuditLog({
      userId: user.id,
      userName: user.name,
      action: "CITIZEN_REGISTERED",
      entityType: "User",
      entityId: user.id,
      details: `Citizen registered via portal (${user.email}).`,
      ipAddress: "127.0.0.1",
    });

    await addNotification({
      userId: user.id,
      title: "Welcome to RTI E Connect",
      message:
        "Your Citizen RTI account is active. You can file requests, track statutory timelines, and lodge Section 19(1) appeals.",
      type: "success",
      link: "/citizen/submit",
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to create user" },
      { status: 500 }
    );
  }
}
