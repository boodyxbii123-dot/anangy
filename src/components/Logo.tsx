import Image from "next/image";

/**
 * The client's real "asnangy." wordmark (public/logo.png). Natural
 * aspect ratio is 500×181 — pass `height` to control the rendered
 * size; width follows automatically via `w-auto`.
 */
export function Logo({
  className = "",
  height = 40,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="asnangy."
        width={500}
        height={181}
        priority
        style={{ height, width: "auto" }}
      />
    </span>
  );
}
