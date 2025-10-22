import type { Metadata, Viewport } from "next";
// import {
//   ClerkProvider
// } from '@clerk/nextjs'
import { Kodchasan } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import { ProfileChecker } from "@/components/auth/ProfileChecker"
import "./globals.css";
// import '@fullcalendar/common/main.css'
// import '@fullcalendar/daygrid/main.css'

const kodchasan = Kodchasan({
  subsets: ["latin"],
  weight: ["200","300", "400", "500", "600", "700"]
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
    <html lang="en">
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
        className={`${kodchasan.className} antialiased bg-bg-img bg-cover bg-black object-cover bg-center bg-blend-luminosity bg-no-repeat`}
      >
        <ProfileChecker />
        <div className="bg-zinc-950/80 min-h-screen">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
    // </ClerkProvider>
  );
}
