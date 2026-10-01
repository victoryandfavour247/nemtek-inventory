import Image from "next/image";
import { imageFor } from "@/lib/products";
import type { CategoryKey } from "@/lib/inventory";

export default function ItemImage({
  item, className = "",
}: { item: { id: string; category: CategoryKey; name: string; image?: string }; className?: string }) {
  // Uploaded photo (data URL) takes precedence over the catalogue artwork.
  if (item.image) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-contain p-1" />
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <Image src={imageFor(item)} alt={item.name} fill sizes="80px" className="object-contain p-1" />
    </div>
  );
}
