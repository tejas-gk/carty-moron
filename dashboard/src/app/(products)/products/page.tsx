import { DataTable } from '@/app/(products)/products/data-table'
import React from 'react'
import prisma from '@/lib/prismadb'

const getAllProducts = async () => {
  const products = await prisma.product.findMany();
  return products
}


const getCategory = async () => {
  const res = await fetch('http://localhost:3001/api/category', { cache: 'no-cache' })
  console.log(res)
  return res.json()
}


export default async function page() {
  const allProducts = await getAllProducts()
  console.log(allProducts)
  return (
    <div className="container py-10 mx-auto">
      <DataTable data={allProducts} />
    </div>
  )
}
