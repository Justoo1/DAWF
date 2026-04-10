import type { Metadata, Viewport } from "next";
// import {
//   ClerkProvider
// } from '@clerk/nextjs'
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster"
import { ProfileChecker } from "@/components/auth/ProfileChecker"
import { ThemeProvider } from "@/components/shared/ThemeProvider"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


export const metadata: Metadata = {
  title: {
    template: "%s | DAWF",
    default: "DAWF",
  },
  description: "DevOps Africa Welfare Fund",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DAWF",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/assets/images/logo.png",
    apple: "/assets/images/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <ClerkProvider appearance={{
    //   variables: {
    //     colorBackground: "#10a07514",
    //     colorPrimary: '#D23D0E',
    //     colorText: '#fff'
        
        
    //   },
    //   elements: {
    //     socialButtonsBlockButton:{
    //       backgroundColor: '#fff'
    //     }
    //   },
    //   layout: {
    //     socialButtonsPlacement: 'bottom',
        
    //     // socialButtonsVariant: 'iconButton',
    //     // termsPageUrl: 'https://clerk.com/terms'
    //   }
      
    // }}>
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="DAWF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DAWF" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/assets/images/logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ProfileChecker />
          <div className="min-h-screen bg-background">
            {children}
          </div>
          <ThemeToggle />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
    // </ClerkProvider>
  );
}
