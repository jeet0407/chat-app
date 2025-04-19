import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request,{ params }: { params: { id: string } }) {
  try {
      const groupId = params?.id;

      if(!groupId){
        return NextResponse.json(
            { message: "Group ID is required" }, 
            { status: 400 }
          );
      }

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

    const messages  = await prisma.chat.findMany({
        where : {
            groupId : groupId,
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

        return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error getting messages:", error);
    return NextResponse.json(
      { message: "Failed to get messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request,{ params }: { params: { id: string } }) {
    try {
        const groupId = params?.id;

        if (!groupId) {
            return NextResponse.json(
              { message: "Group ID is required" }, 
              { status: 400 }
            );
          }
        
        const session = await getServerSession(authOptions);
    
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
    
        const { content } = await request.json();
    
        if (!content || !content.trim()) {
        return NextResponse.json({ message: "Content is required" }, { status: 400 });
        }
    
        const message = await prisma.chat.create({
        data: {
            content,
            userId: session.user.id,
            groupId,
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
        console.error("Error sending message:", error);
        return NextResponse.json(
        { message: "Failed to send message" },
        { status: 500 }
        );
    }
}
