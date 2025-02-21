import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-background flex items-center justify-center p-6"
    >
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold text-foreground mb-6 text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>
        
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Password"
            className="w-full"
          />
          
          {!isLogin && (
            <Input
              type="password"
              placeholder="Confirm Password"
              className="w-full"
            />
          )}
          
          <Button className="w-full">
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
