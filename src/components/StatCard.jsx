export default function StatCard({ title, value }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
