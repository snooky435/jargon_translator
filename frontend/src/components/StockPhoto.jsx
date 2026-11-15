// One stock photo with a very serious title and a not-so-serious caption.
// Props:
//   photo:     one entry from src/data/stockPhotos.js
//   className: optional extra classes (e.g. to control the height)

export default function StockPhoto({ photo, className = "" }) {
  return (
    <figure className={"overflow-hidden rounded-2xl border border-white/10 bg-white/5 " + className}>
      {/* "relative" lets us lay the fake watermark on top of the photo */}
      <div className="relative">
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          className="aspect-[3/2] w-full object-cover"
        />
        {/* A fake stock-photo watermark, for that authentic look */}
        <span className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
          <span className="-rotate-12 font-display text-2xl font-bold tracking-widest text-white/25 sm:text-3xl">
            SYNERGY IMAGES™
          </span>
        </span>
      </div>
      <figcaption className="p-4">
        <p className="font-display text-lg font-semibold text-white">{photo.title}</p>
        <p className="mt-1 text-sm italic text-gray-400">{photo.caption}</p>
      </figcaption>
    </figure>
  );
}
