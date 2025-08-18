import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileAudio, Type, Download, Clock, Shield, Zap, CheckCircle } from "lucide-react"
import Link from "next/link"
import FileUpload from "@/components/file-upload"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <FileAudio className="h-6 w-6 mr-2" />
          <span className="font-bold">AudioScribe</span>
        </Link>
        <nav className="ml-auto flex gap-4  sm:gap-6">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#features">
            Features
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#pricing">
            Pricing
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#about">
            About
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            href="#contact">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        {/* Interactive Upload Section */}
        <section className="w-full py-12 md:py-24 lg:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div
              className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Start Converting Your M4A Files
                </h2>
                <p
                  className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Upload your audio files and watch them transform into accurate text transcriptions in real-time.
                </p>
              </div>

              <FileUpload />

              <p className="text-xs text-muted-foreground">
                No credit card required • First 30 minutes free • Files automatically deleted after 24 hours
              </p>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="w-full py-6 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-4">
                  AI-Powered Transcription
                </Badge>
                <h1
                  className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Convert M4A Files to Text
                  <span className="block text-primary">Instantly & Accurately</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Transform your M4A audio recordings into accurate text transcriptions in minutes. Perfect for
                  meetings, interviews, podcasts, and voice memos.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" className="h-12 px-8">
                  <Upload className="mr-2 h-4 w-4" />
                  Start Converting
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-8 bg-transparent">
                  Try Demo
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                  No signup required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                  Free for first 30 minutes
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Convert your M4A files to text in just three simple steps
                </p>
              </div>
            </div>
            <div
              className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="text-center">
                <CardHeader>
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Upload className="h-6 w-6" />
                  </div>
                  <CardTitle>1. Upload Your M4A File</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Simply drag and drop your M4A audio file or click to browse and select from your device.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Zap className="h-6 w-6" />
                  </div>
                  <CardTitle>2. AI Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our advanced AI analyzes your audio and converts speech to text with high accuracy and speed.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Download className="h-6 w-6" />
                  </div>
                  <CardTitle>3. Download Text</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get your transcription in multiple formats: TXT, DOCX, or PDF. Edit and export as needed.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div
              className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose AudioScribe?</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Powerful features designed to make audio transcription effortless and accurate
                </p>
              </div>
            </div>
            <div
              className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="grid gap-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Lightning Fast</h3>
                      <p className="text-muted-foreground">
                        Convert hours of audio to text in minutes with our optimized AI processing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Type className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">High Accuracy</h3>
                      <p className="text-muted-foreground">
                        {"95%+ accuracy rate with support for multiple languages and accents."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Secure & Private</h3>
                      <p className="text-muted-foreground">
                        Your files are encrypted and automatically deleted after processing. Complete privacy
                        guaranteed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur-3xl" />
                  <Card className="relative w-full max-w-md">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileAudio className="mr-2 h-5 w-5" />
                        meeting-recording.m4a
                      </CardTitle>
                      <CardDescription>2.3 MB • 15:42 duration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full w-3/4"></div>
                        </div>
                        <p className="text-sm text-muted-foreground">{"Processing... 75% complete"}</p>
                        <div className="bg-muted p-3 rounded text-sm">
                          <p className="font-medium">Preview:</p>
                          <p className="text-muted-foreground mt-1">
                            {
                              "\"Good morning everyone, let's start today's meeting by reviewing the quarterly results...\""
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer
        className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 AudioScribe. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy Policy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}
