import NextAuth, { type NextAuthOptions } from "next-auth";

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
					scope: "full_name",
				},
			},
			token: `https://${VATSIM_AUTH_URL}/oauth/token`,
			userinfo: `https://${VATSIM_AUTH_URL}/api/user`,
			clientId: process.env.VATSIM_CLIENT_ID || "",
			clientSecret: process.env.VATSIM_CLIENT_SECRET || "",
			profile(profile) {
				return {
					id: profile.data.cid,
					name: profile.data.personal.name_full,
				};
			},
		},
	],

	session: {
		strategy: "jwt",
	},

	callbacks: {
		async jwt({ token }) {
			return token;
		},
		async session({ session, token }) {
			session.token = token;
			return session;
		},
	},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
