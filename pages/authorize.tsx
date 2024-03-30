import AuthorizeComponent from "@/components/AcceptAuthorize";

export default function AuthorizePage() {
	return(
		<>
			<AuthorizeComponent  mobile={true}/>
		</>
	)
}

export async function getStaticProps({locale}: {locale: string}) {
	return {
		props: {
			messages:{
				...require(`../messages/${locale}.json`),
			}
		},
	};
}

