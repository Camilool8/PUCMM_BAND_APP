import SongCard from "@/components/SongCard";

export default function Home() {
  const recentSongs = [
    { id: 1, title: "Bachata Rosa", artist: "Juan Luis Guerra", coverUrl: "https://placehold.co/400" },
    { id: 2, title: "September", artist: "Earth, Wind & Fire", coverUrl: "https://placehold.co/400" },
    { id: 3, title: "La Bilirrubina", artist: "Juan Luis Guerra", coverUrl: "https://placehold.co/400" },
    { id: 4, title: "Take Five", artist: "Dave Brubeck", coverUrl: "https://placehold.co/400" },
    { id: 5, title: "Ojalá que llueva café", artist: "Juan Luis Guerra", coverUrl: "https://placehold.co/400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="text-display mb-2">Buenos días, Juan</h1>
        <p className="text-text-secondary">Aquí tienes lo último que hemos estado ensayando.</p>
      </section>

      {/* Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-h2">Ensayos Recientes</h2>
            <button className="text-sm font-medium text-brand-blue-primary hover:text-brand-blue-hover">Ver todo</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {recentSongs.map((song) => (
            <SongCard key={song.id} {...song} />
          ))}
        </div>
      </section>
    </div>
  );
}