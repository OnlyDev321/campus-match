export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] py-8 transition-colors duration-150 app-footer">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-(--primary-container) flex items-center justify-center text-white font-mono text-xs font-bold">
            CM
          </div>
          <span className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} CampusMatch. University Academic
            Productivity System.
          </span>
        </div>
      </div>
    </footer>
  );
}
