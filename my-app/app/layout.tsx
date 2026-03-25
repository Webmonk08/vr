import type { Metadata } from "next";
import { Georama } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import Header from '../component/header';
import Footer from "@/component/footer";
import { ToastContainer } from "@/component/toast-container";

const georama = Georama({
  subsets: ['latin'],
  variable: '--font-georama',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "VR",
  description: "Best quality rice seller",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${georama.variable}  antialiased`}
      >
        <ReactQueryProvider>
          <Header />
          {children}
          <Footer />
          <ToastContainer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
