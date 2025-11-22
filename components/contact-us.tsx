import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ContactUs() {
  return (
    <section className="w-full rounded-xl p-6 fade-in-up fade-in-up-delayed-2">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p className="mt-2 text-muted-foreground">Have a question? Reach out to our support team and we will get back to you shortly.</p>

          <div className="mt-4 text-sm text-muted-foreground space-y-2">
            <div>
              <strong>Email:</strong> <a href="mailto:support@bajunow.com" className="text-foreground hover:underline">support@bajunow.com</a>
            </div>
            <div>
              <strong>Phone:</strong> <a href="tel:+123456789" className="text-foreground hover:underline">+1 (234) 567-89</a>
            </div>
            <div className="mt-4">
              <Button variant="default" size="default" asChild>
                <a href="mailto:support@bajunow.com" className="inline-flex items-center">Email Us</a>
              </Button>
            </div>
          </div>
        </div>
        <Card className="p-4 rounded-lg border border-foreground/10 dark:border-foreground/20">
          <CardHeader>
            <h3 className="text-base font-semibold">Send us a message</h3>
          </CardHeader>
          <CardContent>
          <label className="block text-sm font-medium">Your name</label>
          <input className="mt-2 w-full rounded-md border border-foreground/10 p-2 bg-transparent" placeholder="John Doe" />
          <label className="block text-sm font-medium mt-4">Your message</label>
          <textarea className="mt-2 w-full rounded-md border border-foreground/10 p-2 bg-transparent" rows={4} placeholder="How can we help?" />
            <div className="mt-4">
              <Button type="submit">Send message</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
