import Image from "next/image";
import { imageFor } from "@/lib/products";
import type { CategoryKey } from "@/lib/inventory";

export default function ItemImage({
  item, className = "",
}: { item: { id: string; category: CategoryKey; name: string }; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <Image src={imageFor(item)} alt={item.name} fill sizes="80px" className="object-contain p-1" />
    </div>
  );
}
