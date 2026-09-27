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
  const inline = src.startsWith("data:") || src.startsWith("blob:");

  return (
    <span className={`relative block overflow-hidden bg-paper-2 ${className}`}>
      {inline ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      )}
    </span>
  );
}
