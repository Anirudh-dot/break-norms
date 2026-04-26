import Image from "next/image";

interface BatProps {
  swinging: boolean;
}

export default function Bat({ swinging }: BatProps) {
  return (
    <div
      className={`absolute z-20 h-20 w-20 origin-bottom-left transition-transform duration-200 ${
        swinging
          ? "translate-x-[-35px] translate-y-[20px] rotate-[65deg] scale-110"
          : "translate-x-[-130px] translate-y-[-50px] rotate-[-35deg]"
      }`}
      aria-hidden="true"
    >
      <Image
        src="/bat.png"
        alt=""
        width={520}
        height={520}
        className="h-full w-full object-contain"
        priority
      />

      {swinging && (
        <div className="absolute left-[70px] top-[50px] text-xl animate-ping">
          💥
        </div>
      )}
    </div>
  );
}