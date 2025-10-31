import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TestTube } from "lucide-react"

export default async function TestPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Page</h1>
        <p className="text-gray-600 dark:text-gray-400">
          This is a test page to demonstrate navigation and layout
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-6 w-6" />
              Test Component
            </CardTitle>
            <CardDescription>
              A sample card component for testing purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This page demonstrates the basic layout structure with sidebar navigation.
                You can customize this template for your specific needs.
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold mb-2">Template Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Authentication with Clerk</li>
                  <li>Database integration with Prisma</li>
                  <li>Responsive sidebar navigation</li>
                  <li>UI components with shadcn/ui</li>
                  <li>Dark mode support</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
