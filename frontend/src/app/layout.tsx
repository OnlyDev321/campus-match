import "./globals.css";
import Header from "@/components/layout/Header";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        {/* Header for all page  */}
        <Header />
        {/* page content according by route */}
        <main className="flex-1"> {children}</main>
      </body>
    </html>
  );
}
