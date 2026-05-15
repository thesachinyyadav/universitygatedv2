import Image from 'next/image';

export default function PoweredBySocio() {
  return (
    <div className="flex flex-col items-center gap-1 pt-3 pb-4 text-[#8b97b4]">
      <p className="text-[12px]">Powered by</p>
      <Image
        src="/socio.svg"
        alt="SOCIO"
        width={84}
        height={24}
        className="h-5 w-auto"
      />
      <p className="uppercase" style={{ fontSize: '9px', letterSpacing: '2px' }}>
        Connecting Made Simple
      </p>
    </div>
  );
}
