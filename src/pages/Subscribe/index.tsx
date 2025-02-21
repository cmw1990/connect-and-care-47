import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    name: "Basic",
    price: "$9.99",
    features: [
      "Basic care management",
      "Task scheduling",
      "Medication reminders",
      "Care team communication"
    ]
  },
  {
    name: "Professional",
    price: "$24.99",
    features: [
      "Everything in Basic",
      "Advanced health monitoring",
      "Custom care plans",
      "Priority support",
      "Care insights and analytics"
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Everything in Professional",
      "Custom integrations",
      "Dedicated account manager",
      "Training and onboarding",
      "24/7 premium support"
    ]
  }
];

export default function Subscribe() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="p-6 space-y-6"
    >
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-semibold text-foreground mb-4">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground">
          Select the perfect plan for your care management needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className="p-6">
            <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold mb-6">{plan.price}</p>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-5 h-5 text-apple-green mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button className="w-full">
              {plan.name === "Enterprise" ? "Contact Sales" : "Subscribe"}
            </Button>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
