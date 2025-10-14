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

interface TrainData {
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
  const [popularTrains, setPopularTrains] = useState<TrainData[]>([]);
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
      console.error("Error fetching popular trains:", error);
      toast.error("Failed to load popular trains");
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              Popular Train Routes
            </h2>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading trains...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularTrains.map((train) => (
                  <Card key={train.id} className="hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Train className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold text-lg">{train.train_name}</h3>
                            <p className="text-sm text-muted-foreground">#{train.train_number}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{train.duration}</Badge>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{train.source_station}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{train.departure_time}</span>
                        </div>
                        <div className="border-l-2 border-dashed border-muted-foreground/30 ml-2 h-6"></div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium">{train.destination_station}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{train.arrival_time}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Starting from</p>
                          <p className="text-lg font-bold text-primary">₹{train.base_fare}</p>
                        </div>
                        <Button 
                          onClick={() => {
                            setSource(train.source_station);
                            setDestination(train.destination_station);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          size="sm"
                        >
                          Select Route
                        </Button>
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
