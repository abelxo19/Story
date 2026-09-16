import type { Metadata } from "next";
import { IM_Fell_English, Lora } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const storyTitle = IM_Fell_English({
  variable: "--font-story-title",
  subsets: ["latin"],
  weight: "400",
});

const storyBody = Lora({
  variable: "--font-story-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Story | Adventure Tales for Kids",
  description:
    "Illustrated fairy-tale adventures for young readers — Hansel and Gretel and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${storyTitle.variable} ${storyBody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
