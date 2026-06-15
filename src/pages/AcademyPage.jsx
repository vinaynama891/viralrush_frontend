export default function AcademyPage({ academy }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl">
      {academy?.map((a) => (
        <p key={a.id}>
          {a.title} - {a.type}
        </p>
      ))}
    </div>
  );
}
