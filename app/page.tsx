import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Shield, Database, Zap } from "lucide-react"

export default async function HomePage() {
  const { userId } = await auth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">MyApp</span>
          </div>
          <div className="flex items-center gap-4">
            {userId ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Next.js 15 Full-Stack Boilerplate
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Production-ready starter with Clerk Auth, Prisma, PostgreSQL, and shadcn/ui.
            Everything you need to build your next SaaS application.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {userId ? (
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/sign-up">
                <Button size="lg" className="gap-2">
                  Start Building <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Secure Authentication</CardTitle>
              <CardDescription>
                Email OTP authentication powered by Clerk with session management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>✓ Email magic links</li>
                <li>✓ Protected routes</li>
                <li>✓ User webhooks</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Database Ready</CardTitle>
              <CardDescription>
                PostgreSQL with Prisma ORM for type-safe database queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>✓ Docker Compose setup</li>
                <li>✓ Migrations system</li>
                <li>✓ Type-safe queries</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Modern UI</CardTitle>
              <CardDescription>
                Beautiful components with shadcn/ui, Tailwind CSS and dark mode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>✓ Accessible components</li>
                <li>✓ Form validation</li>
                <li>✓ Responsive design</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-32 border-t">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Built with Next.js 15, Clerk, Prisma, and shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  )
}
