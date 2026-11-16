import { useEffect, type ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import {
  getErrorCode,
  getStandardErrorMessage,
} from "@/client/lib/error-messages";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { getClientAuthMode, usesBetterAuthClient } from "@/lib/auth-mode";
import { getSignInHref, getSignInHrefForLocation } from "@/lib/auth-redirect";

const CLOUDFLARE_SETUP_GUIDE_URL =
  "https://github.com/every-app/open-seo/blob/main/docs/SELF_HOSTING_CLOUDFLARE.md#2-configure-authentication-and-secrets";

type CardProps = {
  message: string;
  onRetry: () => void;
};

/**
 * The card for an auth failure, else `fallback`. The route error boundary and
 * the landing redirect both render errors through this, so each auth error
 * code shows the same card everywhere.
 */
export function AuthErrorCard({
  error,
  onRetry,
  fallback,
}: {
  error: unknown;
  onRetry: () => void;
  fallback: ReactNode;
}) {
  const errorCode = getErrorCode(error);
  if (errorCode !== "AUTH_CONFIG_MISSING" && errorCode !== "UNAUTHENTICATED") {
    return fallback;
  }

  const message = getStandardErrorMessage(
    error,
    "Bir şeyler ters gitti. Lütfen tekrar dene.",
  );
  return (
    <div className="flex h-full min-w-0 flex-1 items-center justify-center p-4">
      {errorCode === "AUTH_CONFIG_MISSING" ? (
        <AuthConfigErrorCard message={message} onRetry={onRetry} />
      ) : (
        <UnauthenticatedErrorCard message={message} onRetry={onRetry} />
      )}
    </div>
  );
}

function AuthConfigErrorCard({ message, onRetry }: CardProps) {
  // The hint names the settings of the mode the server actually runs; the
  // alert above already carries the server's exact message.
  const clientAuthMode = getClientAuthMode();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-destructive" />
          Kimlik doğrulama kurulumu gerekli
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>

        {clientAuthMode === "hosted" ? (
          <p className="text-muted-foreground">
            Barındırılan mod için kurulumda{" "}
            <code className="mx-1">BETTER_AUTH_SECRET</code>
            (32+ karakter), <code className="mx-1">BETTER_AUTH_URL</code> ve
            Google OAuth kimlik bilgileri gerekir.
          </p>
        ) : null}
        {clientAuthMode === "everyapp" ? (
          <p className="text-muted-foreground">
            FOXSEO, oturum açmayı yöneten bir Every App gateway&apos;inin
            arkasında çalışır. Gateway&apos;in kimlik anahtarlarını alması için{" "}
            <code className="mx-1">pnpm everyapp install</code> ile kur ve
            uygulamayı gateway üzerinden aç.
          </p>
        ) : null}
        {clientAuthMode === "cloudflare_access" ? (
          <p className="text-muted-foreground">
            Cloudflare Access modu için kurulumda
            <code className="mx-1">TEAM_DOMAIN</code> (tam bir https URL&apos;si)
            ve
            <code className="mx-1">POLICY_AUD</code> ayarlı olmalı; ayrıca bu
            alan adını koruyan bir Access uygulaması gerekir.
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" onClick={onRetry}>
          Tekrar dene
        </Button>
        <Button
          nativeButton={false}
          render={
            <a
              href={CLOUDFLARE_SETUP_GUIDE_URL}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          Kurulum rehberini aç
        </Button>
      </CardFooter>
    </Card>
  );
}

function UnauthenticatedErrorCard({ message, onRetry }: CardProps) {
  // A sign-in page exists wherever Better Auth accounts do.
  const hasSignIn = usesBetterAuthClient();
  const signInHref =
    typeof window === "undefined"
      ? getSignInHref("/")
      : getSignInHrefForLocation(window.location);

  useEffect(() => {
    if (typeof window === "undefined" || !hasSignIn) {
      return;
    }

    window.location.replace(signInHref);
  }, [hasSignIn, signInHref]);

  if (hasSignIn) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Oturum açman gerekiyor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-muted-foreground">
        <p>{message}</p>
        <p>
          Bu kurulum harici kimlik doğrulama kullanıyor. Erişim oturumunu
          yenile, sonra tekrar dene.
        </p>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={onRetry}>Tekrar dene</Button>
      </CardFooter>
    </Card>
  );
}
