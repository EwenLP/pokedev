import { typeColors } from "../utils/TypeColors";

export default function TypeBadge({ type }) {
    console.log(type);
    const color = typeColors[type] || "bg-gray-500";
    console.log(color);
    return (
        <span
            className={`${color} px-3 py-1 rounded text-sm capitalize text-white`}
        >
        {type}
        </span>
    );
}