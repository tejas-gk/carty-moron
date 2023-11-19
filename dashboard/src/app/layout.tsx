import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import TeamSwitcher from '@/components/team-switcher'
import { MainNav } from '@/components/main-nav'
import { Search } from '@/components/search'
import { ModeToggle } from '@/components/mode-toggle'
import Image from 'next/image'
import { UserNav } from '@/components/user-nav'
import { Toaster } from "@/components/ui/toaster"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { EdgeStoreProvider } from '../lib/edgestore';
import { appConfig } from '@/config/app'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: "High Table",
    template: "%s | High Table",
  },
  description: 'Manage your E-commerce store with ease',
  keywords: ['E-commerce', 'Store', 'Dashboard', 'Admin'],
  applicationName: 'High Table',
  creator: 'Vercel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>{appConfig.name}</title>
        <meta name="description" content="" /> 
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <EdgeStoreProvider>
            <Toaster />
            <div className="md:hidden">
              <Image
                src="/examples/dashboard-light.png"
                width={1280}
                height={866}
                alt="Dashboard"
                className="block dark:hidden"
              />
              <Image
                src="/examples/dashboard-dark.png"
                width={1280}
                height={866}
                alt="Dashboard"
                className="hidden dark:block"
              />
            </div>
            <div className="hidden flex-col md:flex">
              <div className="border-b">
                <div className="flex h-16 items-center px-4">
                  <TeamSwitcher />
                  <MainNav className="mx-6" />
                  <div className="ml-auto flex items-center space-x-4">
                    <Search />
                    <ModeToggle />
                    <UserNav />
                  </div>
                </div>
              </div>
              {children}
            </div>
          </EdgeStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
