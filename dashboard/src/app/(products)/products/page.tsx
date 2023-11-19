import { promises as fs } from "fs"
import path from "path"
import { Metadata } from "next"
import Image from "next/image"
import { z } from "zod"
import prisma from "@/lib/prismadb"
import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
export const metadata: Metadata = {
    title: "Products",
    description: "Manage your prodcuts.",
}

const getAllProducts = async () => {
    try {
        const products = await prisma.product.findMany({
            include: {
                colors: true,
                sizes: true,
                Category: true,
            }
        });
        return products
    } catch (err) {
        console.log(err)
    }
}

export default async function TaskPage() {
    const products = await getAllProducts()
    return (
        <>
            <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
                        <p className="text-muted-foreground">
                            Here&apos;s a list of your Products
                        </p>
                    </div>
                </div>
                {/* @ts-ignore */}
                <DataTable data={products} columns={columns} />
            </div>
        </>
    )
}
