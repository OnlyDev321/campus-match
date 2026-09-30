import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/design-system";

const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('campus-match-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch (e) {}
  })();
`;

export const metadata = {
  title: "CampusMatch — University Collaboration & Study Groups",
  description:
    "Unified Light and Dark Theme Design System for CampusMatch academic productivity platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="campus-match-theme-init"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-(--background) text-(--text-primary) antialiased transition-colors duration-150">
        <ThemeProvider>
          <Header />
          <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
            <Sidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
