import { Case } from "@/components/pages/Case";

interface CasePageProps {
	params: Promise<{
		slug: string;
	}>;
}

export async function generateStaticParams() {
	// Возвращаем список всех slug'ов для статической генерации
	return [
		{ slug: "1" },
		{ slug: "2" },
		{ slug: "3" },
	];
}

export default async function CasePage({ params }: CasePageProps) {
	const { slug } = await params;
	return <Case slug={slug} />;
}

