import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract groupId safely, ensuring it's a string
    const groupId = String(params.id);
    
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if the group exists
    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: { groupUsers: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { message: "Group not found" },
        { status: 404 }
      );
    }

    // Check if the user is a member of the group
    const membership = await prisma.groupUsers.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: groupId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "You are not a member of this group" },
        { status: 403 }
      );
    }

    // Return group details with member role and count
    return NextResponse.json({
      ...group,
      role: membership.role,
      memberCount: group._count.groupUsers,
    });
  } catch (error) {
    console.error("Error getting group details:", error);
    return NextResponse.json(
      { message: "Failed to get group details" },
      { status: 500 }
    );
  }
}