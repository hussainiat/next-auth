import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExampleForm } from "@/components/example-form";
import { AdvancedChart } from "@/components/data-visualization/advanced-chart";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Next.js Enterprise Starter Kit
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    A production-ready, feature-rich starter kit for building modern web applications with Next.js, React, TypeScript, and Tailwind CSS.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <a href="/dashboard">Go to Dashboard</a>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="/login">Login</a>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[300px] w-[300px] sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px]">
                  <Image
                    src="/next.svg"
                    alt="Next.js Logo"
                    fill
                    className="object-contain dark:invert"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to build modern web applications
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Next.js 15+</CardTitle>
                  <CardDescription>The React framework for production</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Built on the latest version of Next.js with App Router and React Server Components.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>TypeScript</CardTitle>
                  <CardDescription>Type safety and improved developer experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Fully typed codebase with TypeScript for better code quality and developer productivity.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Tailwind CSS</CardTitle>
                  <CardDescription>Utility-first CSS framework</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Modern styling with Tailwind CSS for rapid UI development and consistent design.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Shadcn UI</CardTitle>
                  <CardDescription>High-quality, accessible UI components</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Beautiful, accessible components built with Radix UI and styled with Tailwind CSS.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Dark Mode</CardTitle>
                  <CardDescription>Built-in dark mode support</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Seamless dark mode integration with next-themes for a better user experience.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Authentication</CardTitle>
                  <CardDescription>Dual authentication modes with enterprise security</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Complete authentication system with JWT token-based and session-based modes, role-based access control, and modern security practices.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Form Handling</CardTitle>
                  <CardDescription>Integrated with react-hook-form and zod</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Powerful form handling with validation using react-hook-form and zod.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Example Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Examples</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Check out some examples of what you can build with this starter kit
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <Tabs defaultValue="components" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="components">UI Components</TabsTrigger>
                  <TabsTrigger value="forms">Form Handling</TabsTrigger>
                  <TabsTrigger value="data">Data Visualization</TabsTrigger>
                  <TabsTrigger value="api">API Integration</TabsTrigger>
                </TabsList>
                <TabsContent value="components" className="p-4 border rounded-md mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Beautiful UI Components</h3>
                    <p>This starter kit includes a comprehensive set of UI components from Shadcn UI, built with Radix UI and styled with Tailwind CSS.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button>Button</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="forms" className="p-4 border rounded-md mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Form Handling</h3>
                    <p>Integrated with react-hook-form and zod validation for powerful form handling capabilities.</p>
                    <div className="mt-6">
                      <ExampleForm />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="data" className="p-4 border rounded-md mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Advanced Data Visualization</h3>
                    <p>Built-in support for interactive data visualization with customizable charts, filters, and animations.</p>
                    <div className="mt-6">
                      <AdvancedChart />
                    </div>
                    <div className="mt-4">
                      <Button asChild size="sm">
                        <a href="/examples">View More Charts</a>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="api" className="p-4 border rounded-md mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Comprehensive API Integration</h3>
                    <p>Support for multiple API patterns including REST, GraphQL, and real-time data with WebSockets.</p>
                    <div className="mt-4">
                      <Button asChild size="sm">
                        <a href="/examples">View API Examples</a>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
