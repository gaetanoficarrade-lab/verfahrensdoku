import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSEO } from "../hooks/useSEO";

const NotFound = () => {
  const location = useLocation();

  useSEO({
    title: "Seite nicht gefunden",
    description: "Die angeforderte Seite existiert nicht. Zurück zur Startseite.",
    canonical: "https://gobd-suite.de",
    robots: "noindex, nofollow",
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Diese Seite existiert nicht</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
};

export default NotFound;
