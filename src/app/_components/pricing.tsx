import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "/mo",
    description: "For individuals exploring AI-driven KT.",
    features: ["1 repo", "Basic RAG Q&A", "Email support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Team",
    price: "$29",
    period: "/user/mo",
    description: "For small teams onboarding faster.",
    features: ["Unlimited repos", "Guided walkthroughs", "PR summaries"],
    cta: "Start Team Plan",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Security, SSO, and dedicated support.",
    features: ["SSO/SAML", "VPC hosting", "Dedicated success"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="w-full border-t border-primary/20 py-20">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <Badge variant="secondary">Billing</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl bg-[linear-gradient(90deg,_#9ca3af_0%,_#ffffff_20%,_#9ca3af_40%,_#9ca3af_100%)] bg-clip-text text-transparent [background-size:200%_100%] [animation:shine_3s_linear_infinite]">
              Simple pricing for every team
            </h2>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                (plan.highlighted ? "border-primary " : "border-primary/20 ") +
                "bg-black transition hover:border-primary"
              }
            >
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="text-muted-foreground">• {f}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={
                    plan.highlighted
                      ? "w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      : "w-full bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

