import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Otium",
  description: "독서 기반 소셜 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-base font-pretendard antialiased">
        {children}
      </body>
    </html>
  );
}
