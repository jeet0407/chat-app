import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from '@/lib/prisma';

// Get messages for a specific group
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

    // Get messages for the group with user information
    const messages = await prisma.chat.findMany({
      where: {
        groupId: groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100, // Limit to last 100 messages
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    return NextResponse.json(
      { message: "Failed to get messages" },
      { status: 500 }
    );
  }
}

// Create a new message in a group
export async function POST(
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

    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "Message content is required" },
        { status: 400 }
      );
    }

    // Create the message
    const message = await prisma.chat.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        groupId: groupId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { message: "Failed to create message" },
      { status: 500 }
    );
  }
}