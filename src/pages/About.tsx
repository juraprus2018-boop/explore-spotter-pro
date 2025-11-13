import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Globe, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">About EatNavigator</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your trusted guide to discovering the best restaurants worldwide
          </p>

          <div className="prose prose-lg max-w-none mb-12">
            <p>
              EatNavigator is a comprehensive restaurant discovery platform that helps food lovers find the perfect dining experience wherever they are. Our mission is to connect people with great food and memorable dining experiences around the world.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Our Story</h2>
            <p>
              Founded with a passion for food and technology, EatNavigator was created to solve a simple problem: finding the right restaurant shouldn't be complicated. We leverage advanced mapping technology and comprehensive restaurant data to provide you with accurate, up-to-date information about dining options near you.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">What We Offer</h2>
            <p>
              Our platform provides detailed information about restaurants including menus, opening hours, contact details, and authentic reviews from real diners. Whether you're looking for a cozy café, a family restaurant, or fine dining, EatNavigator helps you discover the perfect spot.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <MapPin className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Global Coverage</h3>
                <p className="text-muted-foreground">
                  Discover restaurants across multiple countries and cities worldwide
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Community Driven</h3>
                <p className="text-muted-foreground">
                  Real reviews and ratings from authentic diners like you
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Globe className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Multilingual</h3>
                <p className="text-muted-foreground">
                  Available in 20+ languages to serve users worldwide
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Award className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Quality First</h3>
                <p className="text-muted-foreground">
                  Verified information and authentic reviews you can trust
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-4">
              Whether you're a restaurant owner looking to claim your listing or a food enthusiast searching for your next great meal, EatNavigator is here to help. Join thousands of users who trust us to guide their dining decisions.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
