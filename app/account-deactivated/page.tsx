import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

const AccountDeactivatedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-zinc-900 to-zinc-800">
      <Card className="bg-zinc-800/50 p-8 max-w-md border-red-600/30">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-red-600/20 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold text-white">Account Deactivated</h1>

          <p className="text-zinc-400">
            Your account has been deactivated. You no longer have access to the DevOps Africa Welfare Fund system.
          </p>

          <p className="text-zinc-400 text-sm">
            If you believe this is a mistake or need assistance, please contact your administrator.
          </p>

          <div className="pt-4 w-full space-y-2">
            <Link href="/sign-in" className="block w-full">
              <Button variant="outline" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AccountDeactivatedPage
