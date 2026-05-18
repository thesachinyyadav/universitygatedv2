import Image from 'next/image';

export default function PoweredBySocio() {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-2 pb-3 text-[#1f2f57] opacity-70">
      <p className="text-[11px] font-medium">Powered by</p>
      <Image
        src="/socio.svg"
        alt="SOCIO"
        width={64}
        height={18}
        className="h-3.5 w-auto"
      />
    </div>
  );
}
