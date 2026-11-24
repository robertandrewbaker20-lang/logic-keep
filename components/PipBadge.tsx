import Image from "next/image";

type Props = {
  size?: number;
  className?: string;
};

export function PipBadge({ size = 72, className = "" }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-full bg-[#fff6e8] shadow-[0_12px_30px_-12px_rgba(244,201,93,0.65)] ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/art/pip.jpg"
        alt="Pip the raccoon"
        fill
        sizes={`${size}px`}
        className="object-cover object-[center_12%]"
        priority
      />
    </div>
  );
}
