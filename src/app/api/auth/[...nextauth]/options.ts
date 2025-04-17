// authOptions.ts (server-side)
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from '@/lib/prisma';
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"]
  }
}

export const authOptions : NextAuthOptions = {
  providers : [
    CredentialsProvider({
      name: "Credentials",
      credentials : {
        email : {label : "Email" , type : "email" , placeholder : "u@gmail.com"},
        password : {label : "Password" , type : "password" , placeholder : "password"} ,
      },

      async authorize(credentials){
        if(!credentials?.email || !credentials?.password){
          throw new Error("Please enter your email and password")
        }

        try{
          const user = await prisma.user.findUnique({
            where : { email : credentials.email },
          });

          if(!user){
            throw new Error("No user found with this email");
          }

          if(!user.password){
            throw new Error("User has no password set");
          }

          const isPasswordValid = credentials.password === user.password;

          if(!isPasswordValid){
            throw new Error("Invalid password");
          }

          return{
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.image || null,
          };
        }
        catch(error){
          console.error("Authentication error: ", error);
          throw new Error(error instanceof Error ? error.message : "Authentication error");
        }
      } 
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          profilePhotoUrl: profile.picture || null,
        };
      },
    }),
  ],

  pages : {
    signIn : "/",
    error: "/",
  },

  callbacks:{

    async signIn({user , account , profile}){
      if(account?.provider === "google"){
        try{
          const existingUser = await prisma.user.findUnique({
            where : { email : user.email! },
          });

          if(!existingUser){
            await prisma.user.create({
              data : {
                id : user.id,
                email : user.email!,
                name : user.name,
                image : user.image || null,
              },
            });
          }
        }
        catch(error){
          console.error("Error creating user with google ", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }){
      if(user){
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }){
      if(token && session.user ){
        session.user.id = token.id as string;
      }
      return session;
    },

    async redirect({ baseUrl }){
      return baseUrl;
    },
  },

  session:{
    strategy : "jwt",
    maxAge : 30 * 24 * 60 * 60, // 30 days
  },
  secret : process.env.NEXTAUTH_SECRET,
  debug : process.env.NODE_ENV === "development",
}
