import Image from "next/image";

const DEFAULT_TITLE = "The Luxereva's Lookbook";
const DEFAULT_SUBTITLE =
  "Discover how our community styles their favorite Luxereva pieces.";

export default function UgcSection({ ugc }) {
  const items = ugc?.items || [];
  if (items.length === 0) return null;

  const Tile = ({ item }) => (
    <div className="relative aspect-square rounded-xl overflow-hidden bg-cream border border-gold/20 group">
      <Image
        src={item.image}
        alt={item.caption || "Customer styled Luxereva piece"}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {item.caption && (
        <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[11px] px-2 py-1.5 line-clamp-1">
          {item.caption}
        </span>
      )}
    </div>
  );

  return (
    <section className="container-page py-14">
      <h2 className="text-center uppercase tracking-widest2 text-brown-dark text-xl">
        {ugc?.title || DEFAULT_TITLE}
      </h2>
      <p className="text-center text-brown/60 mt-3 max-w-md mx-auto">
        {ugc?.subtitle || DEFAULT_SUBTITLE}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-10">
        {items.map((item) =>
          item.link ? (
            <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer">
              <Tile item={item} />
            </a>
          ) : (
            <Tile key={item.id} item={item} />
          )
        )}
      </div>
    </section>
  );
}
