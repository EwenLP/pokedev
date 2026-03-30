import { Icon } from "@iconify/react";

export default function FavoriteIcon({ active }) {
  return (
    <Icon
      icon={active ? "ph:heart-fill" : "ph:heart"}
      className="w-6 h-6 text-[#61dafbaa] transition"
    />
  );
}