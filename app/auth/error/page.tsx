"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>
            There was a problem signing you in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium text-foreground">{error}</p>
              {errorDescription && (
                <p className="mt-1 text-sm text-muted-foreground">{errorDescription}</p>
              )}
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>This could happen if:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Your sign-in link has expired</li>
              <li>You've already used this link</li>
              <li>There was a problem with the OAuth provider</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/">Try Again</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="mailto:support@taxengine.io">Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
