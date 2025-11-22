import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardContent } from "@/components/ui/card";

export function Hero() {
  return (
    <section className="w-full flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
      <div className="flex-1 text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          BajuNow — Modern, Comfortable Clothing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
          Discover high quality apparel for every season. Crafted from premium
          fabrics with sustainability in mind.
        </p>
        <div className="mt-6 flex items-center justify-center lg:justify-start gap-3">
          <Button asChild>
            <Link href="/shop" className="inline-flex">Shop Now</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/collections">View Collections</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex justify-center lg:justify-end">
        <Card className="w-full max-w-md overflow-hidden fade-in-up fade-in-up-delayed-1">
          <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden flex items-end">
            {/* Light mode background image (fallback to gradient if image missing) */}
            <div className="absolute inset-0 block dark:hidden bg-gradient-to-r from-pink-300 via-violet-300 to-indigo-400">
              <Image src="/images/baju.jpg" alt="Hero background" fill className="object-cover" priority />
            </div>
            {/* Dark mode background image (optional) */}
            <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-pink-600 via-violet-600 to-indigo-700">
              <Image src="/images/baju.jpg" alt="Hero background dark" fill className="object-cover" priority />
            </div>
            {/* Gradient overlay for improved contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <CardContent className="p-6 text-white relative z-10">
              <CardTitle className="text-xl">Summer Linen Shirt</CardTitle>
              <p className="text-sm mt-1">Lightweight. Breathable. Timeless.</p>
              <div className="mt-4 text-sm font-semibold">$49.00</div>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}
