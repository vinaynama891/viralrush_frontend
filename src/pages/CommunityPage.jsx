export default function CommunityPage({ posts, onCreatePost }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl">
      <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg mb-2" onClick={onCreatePost}>
        Create Post
      </button>
      {posts?.map((p) => (
        <p key={p._id}>
          {p.author}: {p.content} ({p.likes} likes)
        </p>
      ))}
    </div>
  );
}
