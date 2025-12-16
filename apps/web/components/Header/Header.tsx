import Search from "./Search";
import "./Header.css";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import simradar24Logo from "@/assets/images/simradar24_logo.svg";
import AuthButton from "./AuthButton";

export default async function Header() {
	const session = await getServerSession(authOptions);

	return (
		<header>
			<figure id="header-logo">
				<Image src={simradar24Logo} alt="simradar24 logo" height={40} width={200} priority />
			</figure>
			<div id="header-search-wrapper">
				<Search />
			</div>
			<AuthButton session={session} />
		</header>
	);
}
