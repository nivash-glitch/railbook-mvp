import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Train, Clock, MapPin, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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

const TrainList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);

  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";

  useEffect(() => {
    fetchTrains();
  }, [source, destination]);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      
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
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Available Trains</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{source}</span>
              <ArrowRight className="h-4 w-4" />
              <span>{destination}</span>
              <span className="ml-4">•</span>
              <span>{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
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
                <Button onClick={() => navigate("/")}>
                  Back to Search
                </Button>
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
      </main>
    </div>
  );
};

export default TrainList;
