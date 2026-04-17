import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { readPolicyAttachment } from "@/lib/policy-attachment-storage";

function safeInlineFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { policyId } = await params;
    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      select: {
        attachmentPath: true,
        attachmentMime: true,
        attachmentName: true,
      },
    });

    if (!policy?.attachmentPath) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBytes = await readPolicyAttachment(policy.attachmentPath);
    if (!fileBytes) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileName = safeInlineFileName(policy.attachmentName ?? "policy.pdf");

    return new NextResponse(new Uint8Array(fileBytes), {
      status: 200,
      headers: {
        "Content-Type": policy.attachmentMime ?? "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error serving policy file:", error);
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
