import React from 'react';
import MobileHome from "@/pages/mobile";

export default function Home() {
	return (
		<MobileHome/>
	);
}
export async function getStaticProps({locale}: {
	locale: string
}) {
	return {
		props: {
			messages: {
				...require(`../messages/${locale}.json`),
			}
		},
	};
}
