import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userGroups = await prisma.groupUsers.findMany({
      where: {
        userId: session.user.id,
      },

      include: {
        group: {
          include: {
            _count: {
              select: { groupUsers: true },
            },
          },
        },
      },

      orderBy: {
        joinedAt: "desc",
      },
    });

    // Extract just the group data and add role and memberCount
    const groups = userGroups.map((ug) => ({
      ...ug.group,
      role: ug.role,
      joinedAt: ug.joinedAt,
      memberCount: ug.group._count.groupUsers,
    }));

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error getting groups:", error);
    return NextResponse.json(
      { message: "Failed to get groups" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, description, passcode } = await request.json();

    if (!name || !passcode) {
      return NextResponse.json(
        { message: "Name and passcode are required" },
        { status: 400 }
      );
    }

    // Use a transaction to create both the group and add the creator as admin
    const result = await prisma.$transaction(async (tx) => {
      // Create group
      const group = await tx.chatGroup.create({
        data: {
          name,
          description,
          passcode,
        },
      });

      // Add creator as admin
      await tx.groupUsers.create({
        data: {
          userId: session.user.id,
          groupId: group.id,
          role: "admin",
        },
      });

      return group;
    });

    // Fetch the group with additional information
    const groupWithMetadata = {
      ...result,
      role: "admin",
      joinedAt: new Date(),
      memberCount: 1,
    };

    return NextResponse.json(groupWithMetadata, { status: 201 });
  } catch (error) {
    console.error("Error creating group: ", error);
    return NextResponse.json(
      { message: "Failed to create group" },
      { status: 500 }
    );
  }
}
