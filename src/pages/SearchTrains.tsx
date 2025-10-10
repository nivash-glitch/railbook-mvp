import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Calendar, ArrowRight, Train, Clock } from "lucide-react";
import { toast } from "sonner";
import StationAutocomplete from "@/components/StationAutocomplete";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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
  const [trains, setTrains] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!source || !destination || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    await fetchTrains();
  };

  const fetchTrains = async () => {
    try {
      setLoading(true);
      setSearched(true);
      
      let query = supabase.from("trains").select("*");
      
      if (source) {
        query = query.ilike("source_station", `%${source}%`);
      }
      
      if (destination) {
        query = query.ilike("destination_station", `%${destination}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTrains(data || []);
      
      if (!data || data.length === 0) {
        toast.info("No trains found for this route");
      }
    } catch (error: any) {
      toast.error("Failed to fetch trains");
    } finally {
      setLoading(false);
    }
  };

  const handleBookTrain = (trainId: string) => {
    const params = new URLSearchParams({
      trainId,
      date,
    });
    navigate(`/book?${params.toString()}`);
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

          {searched && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  {loading ? "Searching..." : `Available Trains`}
                </h2>
                {source && destination && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{source}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{destination}</span>
                    <span className="ml-4">•</span>
                    <span>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">Searching for trains...</p>
                </div>
              ) : trains.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Train className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No trains found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try searching with different stations
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {trains.map((train) => (
                    <Card key={train.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-4">
                              <div className="bg-primary/10 p-2 rounded-lg">
                                <Train className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{train.train_name}</h3>
                                <p className="text-sm text-muted-foreground">#{train.train_number}</p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Departure</p>
                                <p className="font-semibold text-lg">{train.departure_time}</p>
                                <p className="text-sm">{train.source_station}</p>
                              </div>

                              <div className="flex items-center">
                                <div className="flex-1 border-t-2 border-dashed mx-2" />
                                <div className="text-center">
                                  <Clock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                                  <p className="text-xs text-muted-foreground">{train.duration}</p>
                                </div>
                                <div className="flex-1 border-t-2 border-dashed mx-2" />
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">Arrival</p>
                                <p className="font-semibold text-lg">{train.arrival_time}</p>
                                <p className="text-sm">{train.destination_station}</p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                              {train.available_classes?.sleeper && <Badge variant="secondary">Sleeper</Badge>}
                              {train.available_classes?.['3ac'] && <Badge variant="secondary">3A</Badge>}
                              {train.available_classes?.['2ac'] && <Badge variant="secondary">2A</Badge>}
                              {train.available_classes?.['1ac'] && <Badge variant="secondary">1A</Badge>}
                            </div>
                          </div>

                          <div className="md:text-right">
                            <p className="text-2xl font-bold text-primary mb-2">
                              ₹{train.base_fare}
                            </p>
                            <p className="text-xs text-muted-foreground mb-4">Starting from</p>
                            <Button 
                              onClick={() => handleBookTrain(train.id)}
                              className="w-full md:w-auto"
                            >
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {!searched && (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchTrains;
