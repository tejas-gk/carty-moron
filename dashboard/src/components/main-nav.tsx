import Link from "next/link"

import { cn } from "@/lib/utils"
const navItems = [
    {
        name: "Home",
        href: "/",
    },
    {
        name: "Overview",
        href: "/overview",
    },
    {
        name: "Customers",
        href: "/customers",
    },
    {
        name: "Products",
        href: "/products",
    },
    {
        name: "Orders",
        href: "/orders",
    },
    {
        name:"Marketing",
        href:"/marketing"
    }
]
export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    return (
        <nav
            className={cn("flex items-center space-x-4 lg:space-x-6", className)}
            {...props}
        >
            {navItems.map((item) => (
                <Link href={item.href} key={item.name}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    {item.name}
                </Link>
            ))}
        </nav>
    )
}