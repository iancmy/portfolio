import Image from "next/image";

export default function NotFound() {
  return (
    <div className="container min-h-auto h-[40rem] flex not-lg:flex-col not-lg:items-center justify-center gap-12">
      <div className="relative flex flex-1 min-w-md max-w-fit items-center justify-center overflow-hidden rounded-3xl">
        <Image
          className="object-cover"
          src="/images/dom-sad.png"
          alt="dom-sad"
          fill
          sizes="100%"
          loading="eager"
        />
      </div>
      <div className="flex flex-col items-start not-lg:items-center justify-center lg:self-end">
        <h1 className="text-9xl font-bold font-[family-name:var(--font-title)]">
          404
        </h1>
        <p className="text-4xl font-[family-name:var(--font-body)]">
          Page does not exist!
        </p>
      </div>
    </div>
  );
}
