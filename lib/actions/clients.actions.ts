"use server";

import { revalidatePath } from "next/cache";
import prisma from "../prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sanitizeText } from "@/lib/utils/validators";

/** Active clients only — used for employee create/edit pickers so inactive orgs cannot be assigned. */
export async function fetchClients() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Unauthorized", clients: [] as const };
    }
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!me || me.role !== "ADMIN") {
      return { success: false, error: "Forbidden", clients: [] as const };
    }

    const clients = await prisma.client.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return { success: true, clients };
  } catch (error) {
    console.error("fetchClients", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load clients",
      clients: [] as const,
    };
  }
}

export async function createClient(data: { name: string; address?: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!me || me.role !== "ADMIN") {
      return { success: false, error: "Only admins can create clients" };
    }

    const name = data.name.trim();
    if (!name) {
      return { success: false, error: "Client name is required" };
    }

    const addressRaw = data.address?.trim() ?? "";
    const address = addressRaw ? sanitizeText(addressRaw) : null;

    const existing = await prisma.client.findUnique({ where: { name } });
    if (existing) {
      return { success: false, error: "A client with this name already exists" };
    }

    await prisma.client.create({
      data: { name, address, isActive: true },
    });
    revalidatePath("/admin/clients");
    return { success: true };
  } catch (error) {
    console.error("createClient", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create client",
    };
  }
}

export async function updateClient(data: {
  id: string;
  name: string;
  address?: string;
  isActive: boolean;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!me || me.role !== "ADMIN") {
      return { success: false, error: "Only admins can update clients" };
    }

    const name = data.name.trim();
    if (!name) {
      return { success: false, error: "Client name is required" };
    }

    const addressRaw = data.address?.trim() ?? "";
    const address = addressRaw ? sanitizeText(addressRaw) : null;

    const duplicate = await prisma.client.findFirst({
      where: { name, NOT: { id: data.id } },
    });
    if (duplicate) {
      return {
        success: false,
        error: "A client with this name already exists",
      };
    }

    await prisma.client.update({
      where: { id: data.id },
      data: { name, address, isActive: data.isActive },
    });
    revalidatePath("/admin/clients");
    return { success: true };
  } catch (error) {
    console.error("updateClient", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update client",
    };
  }
}

export async function setClientActive(data: { id: string; isActive: boolean }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!me || me.role !== "ADMIN") {
      return { success: false, error: "Only admins can change client status" };
    }

    await prisma.client.update({
      where: { id: data.id },
      data: { isActive: data.isActive },
    });
    revalidatePath("/admin/clients");
    return { success: true };
  } catch (error) {
    console.error("setClientActive", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update client status",
    };
  }
}
