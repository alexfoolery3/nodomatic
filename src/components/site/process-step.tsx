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
      <span className="text-[36px] font-semibold tracking-tight text-metal-400">
        {number}
      </span>
      <h3 className="text-[22px] font-medium tracking-tight text-site-text">
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-site-muted">{description}</p>
    </div>
  );
}
