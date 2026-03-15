import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MarketingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-8">GoBD-Suite</h1>
      <Button asChild>
        <Link to="/auth">Anmelden</Link>
      </Button>
    </div>
  );
};

export default MarketingPage;
