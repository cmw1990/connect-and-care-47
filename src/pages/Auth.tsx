import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import apiFetch from '@wordpress/api-fetch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Configure WordPress API settings
apiFetch.use(apiFetch.createRootURLMiddleware('https://make-life-easier.today'));
apiFetch.use(apiFetch.createNonceMiddleware('your-nonce')); // WordPress will handle this

// Define types for WordPress API responses
interface WPRegisterResponse {
  id: number;
  username: string;
  email: string;
  message?: string;
}

interface WPLoginResponse {
  jwt: string;  // Changed from token to jwt as per Simple JWT Login
  user_email: string;
  user_nicename: string;
  message?: string;
}

const Auth = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!navigator.onLine) {
      toast({
        title: "Error",
        description: "Please check your internet connection and try again",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Register endpoint for Simple JWT Login
        const response = await apiFetch({
          path: '/simple-jwt-login/v1/users',
          method: 'POST',
          data: {
            email: identifier,
            password,
            username: identifier.split('@')[0], // Create username from email
            first_name: firstName,
            last_name: lastName
          }
        }) as WPRegisterResponse;

        if (response.id || response.message?.includes('success')) {
          toast({
            title: "Success!",
            description: "Account created successfully. Please sign in.",
          });
          setIsSignUp(false);
        }
      } else {
        // Login endpoint for Simple JWT Login
        const response = await apiFetch({
          path: '/simple-jwt-login/v1/auth',
          method: 'POST',
          data: {
            email: identifier,
            password,
          }
        }) as WPLoginResponse;

        if (response.jwt) {
          // Store the JWT token
          localStorage.setItem('wp_token', response.jwt);
          
          // Configure future requests to use the JWT
          apiFetch.use((options) => {
            return {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${response.jwt}`
              }
            };
          });
          
          // Redirect to home
          navigate("/");
          
          toast({
            title: "Success!",
            description: "Logged in successfully",
          });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = "An error occurred during authentication";
      
      if (!navigator.onLine) {
        errorMessage = "You are offline. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-100 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up to start managing care coordination"
              : "Sign in with your email or username"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <label htmlFor="firstName">First Name</label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName">Last Name</label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label htmlFor="identifier">Email or Username</label>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or username"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Loading..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Need an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;