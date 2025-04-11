
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center"
    >
      <h1 className="text-6xl font-bold text-foreground mb-4">
        Care Companion
      </h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        Your comprehensive care management platform designed to make caregiving easier,
        more efficient, and more connected than ever before.
      </p>
      <div className="flex gap-4">
        <Button 
          onClick={() => navigate("/auth")}
          className="px-6"
        >
          Get Started
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate("/about")}
          className="px-6"
        >
          Learn More
        </Button>
      </div>
    </motion.div>
  );
}
