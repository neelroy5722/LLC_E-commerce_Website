import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      roles: string[];
    } & DefaultSession["user"];
  }
  interface User {
    role: string;
    roles?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: string;
    roles?: string[];
  }
}
