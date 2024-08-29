import React, {Suspense} from 'react';
import MobileHome from "@/channel/mobile";

export default function Home() {
	return (
		<Suspense fallback={<>Loading...</>}>
			<MobileHome/>
		</Suspense>
	);
}

// export async function getStaticProps({locale}: {
// 	locale: string
// }) {
// 	return {
// 		props: {
// 			messages: {
// 				...require(`../messages/${locale}.json`),
// 			}
// 		},
// 	};
// }
