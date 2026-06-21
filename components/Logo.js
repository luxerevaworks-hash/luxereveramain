import Image from "next/image";

export default function Logo({ className = "" }) {
  return (
    <Image
      src="/images/luxereva-logo-wide.png"
      alt="Luxereva"
      width={842}
      height={209}
      priority
      className={`object-contain ${className}`}
    />
  );
}
