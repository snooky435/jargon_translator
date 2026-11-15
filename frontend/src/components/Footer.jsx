// The very bottom of every page: fake legal text and the photo credit.
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto max-w-6xl space-y-1 px-4 py-6 text-center text-xs text-gray-500">
        <p className="font-display text-sm text-gray-400">
          © 2026 Jargon Translator Holdings, LLC. All synergies reserved.
        </p>
        <p>
          Not a Fortune 500 company. Not a Fortune 5,000 company. Past bandwidth is no guarantee of future
          bandwidth.
        </p>
        <p>
          Stock photos from{" "}
          <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="underline hover:text-gray-300">
            Unsplash
          </a>
          . The &ldquo;SYNERGY IMAGES™&rdquo; watermark is a joke.
        </p>
      </div>
    </footer>
  );
}
