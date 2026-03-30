import { typeColors, typeTranslations } from "../utils/Types";

export default function TypeBadge({ type }) {
	const color = typeColors[type] || "bg-gray-500";
	const label = typeTranslations[type] || type;

	return (
		<span className={`${color} px-3 py-1 rounded text-xs lg:text-sm capitalize text-white`}>
		{label}
		</span>
	);
}