import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import StationAutocomplete from "@/components/StationAutocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SearchTrains = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!source || !destination || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    const params = new URLSearchParams({
      source,
      destination,
      date,
    });
    navigate(`/trains?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Book Train Tickets Online
            </h1>
            <p className="text-lg text-muted-foreground">
              Fast, Easy & Secure Railway Ticket Booking
            </p>
          </div>

          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <StationAutocomplete
                    id="source"
                    label="From Station"
                    placeholder="e.g., New Delhi, Mumbai, Bengaluru"
                    value={source}
                    onChange={setSource}
                    icon={<MapPin className="h-4 w-4 text-primary" />}
                    required
                  />

                  <StationAutocomplete
                    id="destination"
                    label="To Station"
                    placeholder="e.g., Chennai, Kolkata, Hyderabad"
                    value={destination}
                    onChange={setDestination}
                    icon={<MapPin className="h-4 w-4 text-accent" />}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Journey Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Search className="h-5 w-5 mr-2" />
                  Search Trains
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/pnr-status")}>
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">PNR Status</h3>
                <p className="text-sm text-muted-foreground">Check your booking status</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/train-status")}>
              <CardContent className="pt-6 text-center">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Train Status</h3>
                <p className="text-sm text-muted-foreground">Live running status</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/dashboard")}>
              <CardContent className="pt-6 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">My Bookings</h3>
                <p className="text-sm text-muted-foreground">View your tickets</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchTrains;
