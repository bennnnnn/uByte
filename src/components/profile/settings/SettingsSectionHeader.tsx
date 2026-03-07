interface Props {
  title: string;
  description?: string;
  titleClassName?: string;
}

export default function SettingsSectionHeader({ title, description, titleClassName = "text-zinc-900 dark:text-zinc-100" }: Props) {
  return (
    <>
      <h3 className={`mb-2 text-lg font-semibold ${titleClassName}`}>{title}</h3>
      {description && <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
    </>
  );
}
