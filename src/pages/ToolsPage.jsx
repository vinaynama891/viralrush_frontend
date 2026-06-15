export default function ToolsPage({ tools }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl">
      {tools?.map((t) => (
        <p key={t.id}>
          {t.name} - {t.category} ({t.price})
        </p>
      ))}
    </div>
  );
}
