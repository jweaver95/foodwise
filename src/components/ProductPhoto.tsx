import Image from "next/image";

export function ProductPhoto({
  src,
  alt,
  className = "",
  sizes = "160px",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <span className={`relative block overflow-hidden bg-paper-2 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
      />
    </span>
  );
}
