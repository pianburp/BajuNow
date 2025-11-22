import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shirt, Truck, RefreshCcw } from "lucide-react";

const FEATURES = [
  {
    title: "Premium Fabrics",
    description: "We carefully select materials for comfort and longevity.",
    svg: (
      <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gradient-to-br from-pink-300 to-violet-400 dark:from-pink-600 dark:to-violet-600">
        <Shirt className="w-6 h-6 text-white" aria-hidden />
      </div>
    ),
  },
  {
    title: "Free Shipping",
    description: "Enjoy free shipping on orders over $50 within the country.",
    svg: (
      <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gradient-to-br from-cyan-200 to-indigo-300 dark:from-cyan-700 dark:to-indigo-600">
        <Truck className="w-6 h-6 text-white" aria-hidden />
      </div>
    ),
  },
  {
    title: "Easy Returns",
    description: "Hassle-free 30-day returns and responsive customer support.",
    svg: (
      <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gradient-to-br from-emerald-200 to-sky-300 dark:from-emerald-700 dark:to-sky-600">
        <RefreshCcw className="w-6 h-6 text-white" aria-hidden />
      </div>
    ),
  },
];

export function Features() {
  return (
    <section className="w-full bg-background/50 dark:bg-background/10 rounded-xl p-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">Why shop with BajuNow</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {FEATURES.map((f, idx) => (
            <Card
              key={f.title}
              className={`p-6 group hover-scale transition-transform duration-300 ease-in-out shadow-sm fade-in-up fade-in-up-delayed-${idx + 1}`}
              style={{ animationDuration: "420ms" }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-md flex items-center justify-center">{f.svg}</div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
