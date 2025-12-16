import NextAuth, { type DefaultSession, type NextAuthOptions } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			cid: number;
		} & DefaultSession["user"];
	}

	interface User {
		cid: number;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		cid: number;
	}
}

const VATSIM_AUTH_URL = process.env.VATSIM_AUTH_URL || "auth-dev.vatsim.net";

export const authOptions: NextAuthOptions = {
	providers: [
		{
			id: "vatsim",
			name: "VATSIM",
			type: "oauth",

			authorization: {
				url: `https://${VATSIM_AUTH_URL}/oauth/authorize`,
				params: {
					scope: "full_name vatsim_details email",
				},
			},

			token: `https://${VATSIM_AUTH_URL}/oauth/token`,
			userinfo: `https://${VATSIM_AUTH_URL}/api/user`,

			clientId: process.env.VATSIM_CLIENT_ID || "",
			clientSecret: process.env.VATSIM_CLIENT_SECRET || "",

			profile(profile) {
				return {
					id: profile.data.cid.toString(),
					cid: profile.data.cid,
					name: profile.data.personal.name_full,
					email: profile.data.personal.email,
				};
			},
		},
	],

	session: {
		strategy: "jwt",
	},

	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.cid = user.cid;
			}
			return token;
		},

		async session({ session, token }) {
			session.user.cid = token.cid;
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
