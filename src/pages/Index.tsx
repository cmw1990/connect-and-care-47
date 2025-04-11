
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Brain, Users, Baby, Shield } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative pt-16 pb-24 overflow-hidden"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="w-full lg:w-1/2 space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold text-foreground"
              >
                Care Companion
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-muted-foreground max-w-2xl"
              >
                Your comprehensive care management platform designed to make caregiving easier,
                more efficient, and more connected than ever before.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Button 
                  onClick={() => navigate("/auth")}
                  className="px-6 text-base"
                  size="lg"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/about")}
                  className="px-6 text-base"
                  size="lg"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="w-full lg:w-1/2"
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1576765608866-5b51046452be?q=80&w=1000" 
                  alt="Elderly care" 
                  className="w-full object-cover h-[400px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <p className="text-white text-lg font-medium">Compassionate care for your loved ones</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Specialized Care Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer a range of specialized care services to meet the unique needs of every individual
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: "Senior Care", 
                description: "Compassionate care for elderly individuals with personalized support and assistance.", 
                icon: Heart,
                color: "bg-red-100 text-red-500" 
              },
              { 
                title: "Child Care", 
                description: "Safe and nurturing care for children with engaging activities and educational support.", 
                icon: Baby,
                color: "bg-blue-100 text-blue-500" 
              },
              { 
                title: "Special Needs", 
                description: "Specialized care for individuals with disabilities or special requirements.", 
                icon: Brain,
                color: "bg-purple-100 text-purple-500" 
              },
              { 
                title: "Respite Care", 
                description: "Temporary relief for primary caregivers, offering short-term professional care.", 
                icon: Users,
                color: "bg-green-100 text-green-500" 
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from families who have experienced the difference of our care services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Daughter of care recipient",
                quote: "The Care Companion app has transformed how I coordinate care for my mother. The medication tracking alone has been a lifesaver.",
                image: "https://randomuser.me/api/portraits/women/44.jpg"
              },
              {
                name: "Michael Thompson",
                role: "Care recipient",
                quote: "I feel more independent with this system. I can manage my own medication schedule while my family has peace of mind.",
                image: "https://randomuser.me/api/portraits/men/32.jpg"
              },
              {
                name: "Jennifer Davis",
                role: "Professional caregiver",
                quote: "As a caregiver, this platform makes it easy to coordinate with family members and ensure continuity of care.",
                image: "https://randomuser.me/api/portraits/women/68.jpg"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 shadow border border-border/50"
              >
                <div className="flex items-center mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Shield key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to transform your caregiving experience?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of families who have simplified their care coordination with our platform.
            </p>
            <Button 
              onClick={() => navigate("/auth")}
              className="px-8 py-6 text-lg"
              size="lg"
            >
              Get Started Today
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Care Companion</h3>
              <p className="text-muted-foreground">
                Making caregiving easier, more efficient, and more connected.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Senior Care</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Child Care</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Special Needs Care</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Respite Care</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">How It Works</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Testimonials</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Care Companion. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
