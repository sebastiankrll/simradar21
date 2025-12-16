"use client";

import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";

export default function AuthButton({ session }: { session: Session | null }) {
	if (!session) {
		return (
			<button type="button" onClick={() => signIn("vatsim")} id="header-vatsim-login">
				Login with VATSIM
			</button>
		);
	}

	return (
		<button type="button" onClick={() => signOut()} id="header-vatsim-login">
			Logout
		</button>
	);
}
