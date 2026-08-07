import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Music2 } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";

export function NotFound() {
  useDocumentTitle("404 — Page Not Found");
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10">
            <Music2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <p className="text-7xl font-black text-gradient-green sm:text-8xl">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Page not found
        </h1>
        <p className="mx-auto mt-2 max-w-md text-secondary-text">
          The page you're looking for doesn't exist or has been moved. Let's get
          you back to the music.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => navigate("/")}>
            <Home className="h-4 w-4" />
            Go Home
          </Button>
          <Button variant="outline" onClick={() => navigate("/search?q=love")}>
            <Music2 className="h-4 w-4" />
            Search Songs
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
