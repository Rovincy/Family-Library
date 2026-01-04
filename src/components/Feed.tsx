export default function Feed() {
  const mockPosts = [
    { id: 1, caption: "Family dinner tonight ❤️", likes: 42 },
    { id: 2, caption: "Kids playing in the park 🌳", likes: 38 },
  ];

  return (
    <div className="max-w-lg mx-auto pb-20">
      {mockPosts.map(post => (
        <div key={post.id} className="bg-white mb-8 rounded-lg shadow-md overflow-hidden">
          <div className="h-96 bg-gradient-to-br from-igBlue to-igPurple flex items-center justify-center text-white text-2xl">
            Photo Placeholder
          </div>
          <div className="p-4">
            <p className="font-medium">{post.caption}</p>
            <p className="text-sm text-gray-500 mt-2">❤️ {post.likes} likes</p>
          </div>
        </div>
      ))}
    </div>
  );
}