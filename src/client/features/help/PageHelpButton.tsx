import { CircleHelp, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/client/components/ui/dialog";
import { PAGE_HELP, type PageHelpTopic } from "./pageHelpContent";

/** The "?" next to a page title; opens a plain-language guide to the page. */
export function PageHelpButton({ topic }: { topic: PageHelpTopic }) {
  const help = PAGE_HELP[topic];
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label={`${help.title} sayfası ne işe yarar?`}
            title="Bu sayfa ne işe yarar?"
            className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          />
        }
      >
        <CircleHelp className="size-5" />
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{help.title}</DialogTitle>
          <DialogDescription className="text-base text-foreground">
            {help.summary}
          </DialogDescription>
        </DialogHeader>

        {help.steps ? (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Nasıl kullanılır?</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              {help.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {help.terms ? (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Bilmen gereken terimler</h3>
            <dl className="space-y-2 text-sm">
              {help.terms.map(({ term, meaning }) => (
                <div key={term}>
                  <dt className="font-medium">{term}</dt>
                  <dd className="text-muted-foreground">{meaning}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {help.tip ? (
          <div className="flex gap-2 rounded-lg bg-muted p-3 text-sm">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>{help.tip}</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
