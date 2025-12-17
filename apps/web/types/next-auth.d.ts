import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
	interface Session {
		token: JWT;
	}
}
