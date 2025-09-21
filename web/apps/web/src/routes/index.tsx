import { createFileRoute } from "@tanstack/react-router"
import { orpc } from "@/utils/orpc"
import { useQuery } from "@tanstack/react-query"
import { MapPin, Activity, Radio } from "lucide-react"

export const Route = createFileRoute("/")({
  component: HomeComponent,
})

function HomeComponent() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions())

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto max-w-4xl px-6 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">Swarm</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Reinventing FirstNet with AI
          </p>
        </div>
      </section>

      {/* Status Section */}
      <section className="container mx-auto max-w-4xl px-6 pb-16">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">System Status</h2>
              <p className="text-sm text-muted-foreground">Real-time connection monitoring</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full transition-colors ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
              />
              <span className="text-sm font-medium text-foreground">
                {healthCheck.isLoading ? "Checking..." : healthCheck.data ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Placeholder Sections */}
      <section className="container mx-auto max-w-4xl px-6 pb-16">
          <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Crisis Heatmap</h3>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">AI Network Load Management</h3>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Smart Dispatch Channels</h3>
          </div>
        </div>
      </section>
    </div>
  )
}
