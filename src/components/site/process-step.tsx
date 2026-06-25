export function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-[30px] font-semibold tracking-tight text-metal-400 sm:text-[36px]">
        {number}
      </span>
      <h3 className="text-xl font-medium tracking-tight text-site-text sm:text-[22px]">
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-site-muted">{description}</p>
    </div>
  );
}
