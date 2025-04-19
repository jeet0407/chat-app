import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;
    
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }


    const group = await prisma.chatGroup.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: { groupUsers: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
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
