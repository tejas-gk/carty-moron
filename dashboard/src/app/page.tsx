import { Metadata } from "next"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { MainNav } from "@/components/main-nav"
import { Overview } from "@/components/overview"
import { RecentSales } from "@/components/recent-sales"
import { Search } from "@/components/search"
import TeamSwitcher from "@/components/team-switcher"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import prisma from "@/lib/prismadb"
import { Icons } from "@/components/icons"
import StoreCard from "../components/cards/store-card"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Example dashboard app built using the components.",
}

const getOrders = async () => {
  const res = await prisma.order.findMany({
    include: {
      OrderItems: true,
      user: true
    }
  })
  return res
}

const getUsers = async () => {
  const res = await prisma.user.count()
  return res
}

export default async function DashboardPage() {
  const orders = await getOrders()
  console.log(orders)
  const users = await getUsers()
  console.log(users)
  const totalRevenue = orders.reduce((acc, order) => {
    return acc + order.OrderItems.reduce((acc, item) => {
      return acc + item.amount
    }, 0)
  }
    , 0)

  const formattedRevenue = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumSignificantDigits: 3,
  }).format(totalRevenue);

  // const calculateRevenueIncrease = (revenueData, numberOfMonths, timeUnit) => {
  //   // Assuming revenueData is an array of objects with a createdAt field

  //   // Sort the revenue data by createdAt in ascending order
  //   const sortedData = revenueData.sort((a, b) => a.createdAt - b.createdAt);

  //   // Get the revenue for the current time period
  //   const currentTimestampRevenue = sortedData[sortedData.length - 1]?.revenue || 0;

  //   // Get the revenue for the previous time period
  //   const previousTimestampRevenue =
  //     sortedData[sortedData.length - 1 - numberOfMonths]?.revenue || 0;

  //   // Calculate the percentage increase
  //   const percentageIncrease =
  //     ((currentTimestampRevenue - previousTimestampRevenue) / previousTimestampRevenue) * 100;

  //   return percentageIncrease;
  // };

  // console.log('orders', calculateRevenueIncrease(orders, 1, 'month'))


  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="reports">
              Reports
            </TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <Icons.totalRevenue />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formattedRevenue}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +10%
                    from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Subscriptions
                  </CardTitle>
                  <Icons.subscriptions />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2350</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <Icons.sales />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12,234</div>
                  <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Users
                  </CardTitle>
                  <Icons.manyUsers  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview data={orders.map(order => ({ ...order, user: { ...order.user, name: order.user.name || '' } }))} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales data={orders.map(order => ({ ...order, user: { ...order.user, name: order.user.name || '' } }))} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-3 gap-4
            ">
            <StoreCard/>
            <StoreCard/>
            <StoreCard/>
            <StoreCard/>
            <StoreCard/>
            <StoreCard/>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}