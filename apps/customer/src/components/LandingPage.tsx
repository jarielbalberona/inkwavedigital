"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { QrCode, Coffee, Menu, TrendingUp, Users, Zap, ArrowRight, Check, Table2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export function LandingPage() {
  const [showBetaDialog, setShowBetaDialog] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [establishmentName, setEstablishmentName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const problemsSectionRef = React.useRef<any>(null)

  const scrollToProblems = () => {
    problemsSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleBetaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !establishmentName) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      await api.post("/api/v1/beta/signup", {
        email,
        establishmentName,
      })
      toast.success("Thanks for signing up! We'll be in touch soon.")
      setEmail("")
      setEstablishmentName("")
      setShowBetaDialog(false)
    } catch (error: unknown) {
      const errorMessage = 
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 
        "Failed to sign up. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header data-slot="header" className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="size-6 text-primary" />
            <span className="text-xl font-bold">Dumadine</span>
          </div>
          <Button variant="default" size="sm">
            Schedule Demo
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section data-slot="hero" className="container mx-auto px-4 py-20 md:py-32 lg:py-40">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Transform Your <span className="text-primary">Dining Experience</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
            Contactless QR-based ordering meets intelligent operations. Streamline your café and restaurant workflow and delight your
            customers with Dumadine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Dialog open={showBetaDialog} onOpenChange={setShowBetaDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  Sign Up for Beta <ArrowRight className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join the Beta Program</DialogTitle>
                  <DialogDescription>
                    Be among the first to transform your café or restaurant. Limited spots available.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBetaSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="establishment">Establishment Name</Label>
                    <Input
                      id="establishment"
                      type="text"
                      placeholder="Your Café or Restaurant Name"
                      value={establishmentName}
                      onChange={(e) => setEstablishmentName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Get Early Access"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="lg" onClick={scrollToProblems}>
              Learn More
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">Limited beta spots available</p>
        </div>
      </section>

      {/* What We Solve Section */}
      <section ref={problemsSectionRef} data-slot="problems" className="bg-secondary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What We Solve</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <span className="text-primary">For Café & Restaurant Owners</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Check className="size-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Reduce order confusion and mistakes</p>
                </div>
                <div className="flex gap-2">
                  <Check className="size-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Streamline kitchen operations</p>
                </div>
                <div className="flex gap-2">
                  <Check className="size-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Boost staff efficiency and training</p>
                </div>
                <div className="flex gap-2">
                  <Check className="size-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Gain valuable customer insights</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-start gap-2">
                  <span className="text-primary">For Customers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Check className="size-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Contactless, hygienic ordering</p>
                </div>
                <div className="flex gap-2">
                  <Check className="size-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Faster service, shorter lines</p>
                </div>
                <div className="flex gap-2">
                  <Check className="size-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Easy personalization and preferences</p>
                </div>
                <div className="flex gap-2">
                  <Check className="size-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">Real-time order status updates</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section data-slot="features" className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <QrCode className="size-8 text-primary mb-3" />
              <CardTitle>QR Code Ordering</CardTitle>
              <CardDescription>Frictionless, contactless menu access and ordering</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="size-8 text-primary mb-3" />
              <CardTitle>Kitchen Display System</CardTitle>
              <CardDescription>Real-time order management directly to kitchen staff</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Menu className="size-8 text-primary mb-3" />
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Dynamic menu updates, pricing, and availability control</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="size-8 text-primary mb-3" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Track sales, trends, and customer preferences</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="size-8 text-primary mb-3" />
              <CardTitle>Customer Loyalty</CardTitle>
              <CardDescription>Build repeat business with loyalty and rewards programs</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Table2 className="size-8 text-primary mb-3" />
              <CardTitle>Table Management</CardTitle>
              <CardDescription>Organize tables, generate QR codes, and track seating</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Coffee className="size-8 text-primary mb-3" />
              <CardTitle>Multi-Location</CardTitle>
              <CardDescription>Manage multiple café and restaurant locations from one dashboard</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section data-slot="how-it-works" className="bg-secondary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                { num: 1, title: "Customer Scans QR", desc: "At table or counter, customers scan unique QR code" },
                { num: 2, title: "Browse & Order", desc: "Browse your café or restaurant menu with real-time availability" },
                { num: 3, title: "Customize & Pay", desc: "Personalize items and complete payment securely" },
                { num: 4, title: "Kitchen Prepares", desc: "Order appears instantly on Kitchen Display System" },
                { num: 5, title: "Track Progress", desc: "Customer receives real-time order status updates" },
                { num: 6, title: "Ready & Pickup", desc: "Staff confirms completion, customer picks up order" },
              ].map((step) => (
                <div key={step.num} className="flex gap-6 md:gap-8">
                  <div className="flex flex-col items-center">
                    <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {step.num}
                    </div>
                    {step.num !== 6 && <div className="w-1 h-16 bg-border my-2" />}
                  </div>
                  <div className="pt-2 pb-8 md:pb-0">
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Dumadine */}
      <section data-slot="why" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Dumadine?</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Born in Dumaguete City (known locally as "Duma"), where "duma" means "the act"—for us, it's the act of dining. Dumadine honors the simple joy of sharing great food and coffee together. We believe the perfect
            marriage of print and pixels creates seamless, intuitive experiences.
          </p>
          <p className="text-base text-muted-foreground">
            Built by café enthusiasts for café owners who want to elevate their operation without losing the personal
            touch that makes cafés special.
          </p>
        </div>
      </section>

      {/* Beta Waitlist CTA */}
      <section data-slot="waitlist" className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Beta</h2>
            <p className="text-lg opacity-90 mb-8">
              Be among the first to transform your café or restaurant. Limited spots available for beta testers.
            </p>
            <Dialog open={showBetaDialog} onOpenChange={setShowBetaDialog}>
              <DialogTrigger asChild>
                <Button size="lg" variant="secondary" className="gap-2">
                  Get Early Access <ArrowRight className="size-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join the Beta Program</DialogTitle>
                  <DialogDescription>
                    Be among the first to transform your café or restaurant. Limited spots available.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBetaSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="beta-email">Email</Label>
                    <Input
                      id="beta-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beta-establishment">Establishment Name</Label>
                    <Input
                      id="beta-establishment"
                      type="text"
                      placeholder="Your Café or Restaurant Name"
                      value={establishmentName}
                      onChange={(e) => setEstablishmentName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Get Early Access"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer data-slot="footer" className="bg-secondary border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="size-5 text-primary" />
                <span className="font-semibold">Dumadine</span>
              </div>
              <p className="text-sm text-muted-foreground">QR-based ordering for modern cafés and restaurants</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:hello@inkwavebrand.ing" className="hover:text-foreground transition">
                    hello@inkwavebrand.ing
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-sm text-muted-foreground text-center">
            <p>Built with ❤️ for local cafés and restaurants by Ink Wave Branding</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
