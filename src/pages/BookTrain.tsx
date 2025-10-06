import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Train, User as UserIcon, Calendar } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface TrainData {
  id: string;
  train_number: string;
  train_name: string;
  source_station: string;
  destination_station: string;
  departure_time: string;
  arrival_time: string;
  base_fare: number;
  available_classes: any;
}

const BookTrain = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [train, setTrain] = useState<TrainData | null>(null);
  const [loading, setLoading] = useState(false);
  const [passengerName, setPassengerName] = useState("");
  const [passengerAge, setPassengerAge] = useState("");
  const [passengerGender, setPassengerGender] = useState("");
  const [travelClass, setTravelClass] = useState("");

  const trainId = searchParams.get("trainId");
  const date = searchParams.get("date");

  useEffect(() => {
    checkAuth();
    if (trainId) {
      fetchTrain();
    }
  }, [trainId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please login to book tickets");
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchTrain = async () => {
    try {
      const { data, error } = await supabase
        .from("trains")
        .select("*")
        .eq("id", trainId)
        .single();

      if (error) throw error;
      setTrain(data);
    } catch (error: any) {
      toast.error("Failed to fetch train details");
      navigate("/");
    }
  };

  const calculateFare = () => {
    if (!train || !travelClass) return 0;
    const multipliers: Record<string, number> = {
      sleeper: 1,
      "3ac": 1.5,
      "2ac": 2,
      "1ac": 3,
    };
    return train.base_fare * (multipliers[travelClass] || 1);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !train) return;

    try {
      setLoading(true);

      // Generate PNR
      const { data: pnrData, error: pnrError } = await supabase
        .rpc("generate_pnr");

      if (pnrError) throw pnrError;

      const { error } = await supabase.from("bookings").insert({
        pnr: pnrData,
        user_id: user.id,
        train_id: train.id,
        passenger_name: passengerName,
        passenger_age: parseInt(passengerAge),
        passenger_gender: passengerGender,
        travel_date: date,
        class: travelClass,
        seat_number: `${travelClass.toUpperCase()}-${Math.floor(Math.random() * 72) + 1}`,
        fare_paid: calculateFare(),
      });

      if (error) throw error;

      toast.success("Ticket booked successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to book ticket");
    } finally {
      setLoading(false);
    }
  };

  if (!train) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading train details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8">Book Your Ticket</h1>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Passenger Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBooking} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Passenger Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter full name"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age *</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="Enter age"
                          value={passengerAge}
                          onChange={(e) => setPassengerAge(e.target.value)}
                          min="1"
                          max="120"
                          required
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender *</Label>
                        <Select 
                          value={passengerGender} 
                          onValueChange={setPassengerGender}
                          disabled={loading}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class">Travel Class *</Label>
                      <Select 
                        value={travelClass} 
                        onValueChange={setTravelClass}
                        disabled={loading}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {train.available_classes?.sleeper && (
                            <SelectItem value="sleeper">Sleeper (SL)</SelectItem>
                          )}
                          {train.available_classes?.['3ac'] && (
                            <SelectItem value="3ac">Third AC (3A)</SelectItem>
                          )}
                          {train.available_classes?.['2ac'] && (
                            <SelectItem value="2ac">Second AC (2A)</SelectItem>
                          )}
                          {train.available_classes?.['1ac'] && (
                            <SelectItem value="1ac">First AC (1A)</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Processing..." : "Confirm Booking"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Train className="h-5 w-5" />
                    Train Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Train</p>
                    <p className="font-semibold">{train.train_name}</p>
                    <p className="text-xs">#{train.train_number}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">From</p>
                    <p className="font-semibold">{train.source_station}</p>
                    <p className="text-xs">{train.departure_time}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">To</p>
                    <p className="font-semibold">{train.destination_station}</p>
                    <p className="text-xs">{train.arrival_time}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date
                    </p>
                    <p className="font-semibold">
                      {new Date(date || "").toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fare Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Base Fare</span>
                      <span>₹{train.base_fare}</span>
                    </div>
                    {travelClass && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Class Charge</span>
                          <span>₹{calculateFare() - train.base_fare}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-primary">₹{calculateFare()}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookTrain;
