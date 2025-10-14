import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Calendar, ArrowRight, Clock, Train } from "lucide-react";
import { toast } from "sonner";
import StationAutocomplete from "@/components/StationAutocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface Train {
  id: string;
  train_number: string;
  train_name: string;
  source_station: string;
  destination_station: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  base_fare: number;
  available_classes: any;
}

const SearchTrains = () => {
  const navigate = useNavigate();
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [popularTrains, setPopularTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularTrains();
  }, []);

  const fetchPopularTrains = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trains")
        .select("*")
        .limit(6);

      if (error) throw error;
      setPopularTrains(data || []);
    } catch (error) {
      console.error("Error fetching trains:", error);
    } finally {
      setLoading(false);
    }
  };

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

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Popular Trains</h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading trains...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {popularTrains.map((train) => (
                  <Card key={train.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Train className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-lg">{train.train_name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">#{train.train_number}</p>
                        </div>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">From</p>
                            <p className="font-semibold">{train.source_station}</p>
                            <p className="text-sm text-muted-foreground">{train.departure_time}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">To</p>
                            <p className="font-semibold">{train.destination_station}</p>
                            <p className="text-sm text-muted-foreground">{train.arrival_time}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{train.duration}</span>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                          <div>
                            <p className="text-sm text-muted-foreground">Starting from</p>
                            <p className="text-xl font-bold text-primary">₹{train.base_fare}</p>
                          </div>
                          <Button 
                            onClick={() => {
                              setSource(train.source_station);
                              setDestination(train.destination_station);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            Select Route
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchTrains;
