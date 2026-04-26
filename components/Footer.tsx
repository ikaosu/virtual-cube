const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL ?? "";

export default function Footer() {
  return (
    <footer className="py-4 text-center space-x-4">
      <a
        href="https://github.com/cs0x7f/cstimer"
        target="_blank"
        rel="noreferrer"
        className="text-xs text-gray-400 hover:text-indigo-500 hover:underline"
      >
        cstimer (GPLv3)
      </a>
      {REPO_URL && (
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-gray-400 hover:text-indigo-500 hover:underline"
        >
          ソースコード
        </a>
      )}
      <span className="text-xs text-gray-400">Licensed under GPLv3</span>
    </footer>
  );
}
