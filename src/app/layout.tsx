import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsSidebar } from "@/components/SettingsSidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pomolearn — AI-Powered Focus Learning",
  description:
    "Master any topic with AI-generated Pomodoro study sessions. Pomolearn combines focused learning bursts with intelligent content generation and adaptive quizzes.",
  keywords: [
    "pomodoro",
    "learning",
    "AI",
    "study",
    "focus",
    "gemini",
    "education",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ThemeToggle />
          <SettingsSidebar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
