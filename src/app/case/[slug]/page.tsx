import { Case } from "@/components/pages/Case";

interface CasePageProps {
	params: Promise<{
		slug: string;
	}>;
}

export default async function CasePage({ params }: CasePageProps) {
	const { slug } = await params;
	return <Case slug={slug} />;
}

