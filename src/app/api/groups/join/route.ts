import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try{
        const session = await getServerSession(authOptions);

        if(!session || !session.user){
            return NextResponse.json({message : "Unauthorized"}, {status : 401});
        }

        const {passcode} = await request.json();

        if(!passcode){

            return NextResponse.json({message : "Passcode is required"}, {status : 400});

        }

        const group = await prisma.chatGroup.findFirst({
            where : { passcode },
        });

        if(!group){
            return NextResponse.json({message : "Group not found"}, {status : 404});
        }

        const existingMember = await prisma.groupUsers.findUnique({
            where : {
                userId_groupId : {
                    userId : session.user.id,
                    groupId : group.id,
                },
            },
        })

        if(existingMember){
            return NextResponse.json({...group , role : existingMember.role , joinedAt : existingMember.joinedAt });
        }

        const membership = await prisma.groupUsers.create({
            data : {
                userId : session.user.id,
                groupId : group.id,
                role : "MEMBER",
            },
        });

        return NextResponse.json({
            ...group,
            role : membership.role,
            joinedAt : membership.joinedAt,
        })

    } catch(error){
        console.error("Error joining group: ", error);
        return NextResponse.json({message : "Internal Server Error"}, {status : 500});
    }
}