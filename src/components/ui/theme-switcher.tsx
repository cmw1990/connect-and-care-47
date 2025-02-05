import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Monitor, Stethoscope, Apple } from "lucide-react";

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState("theme-medical");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <div className="fixed top-4 right-4 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme("theme-medical")}
        className={theme === "theme-medical" ? "border-primary" : ""}
        title="Medical Theme"
      >
        <Stethoscope className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme("theme-apple")}
        className={theme === "theme-apple" ? "border-primary" : ""}
        title="Apple Theme"
      >
        <Apple className="h-4 w-4" />
      </Button>
    </div>
  );
};