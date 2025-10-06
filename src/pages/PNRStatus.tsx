import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, CheckCircle, Train, User, Calendar, CreditCard } from "lucide-react";

interface BookingData {
  pnr: string;
  passenger_name: string;
  passenger_age: number;
  passenger_gender: string;
  travel_date: string;
  class: string;
  seat_number: string;
  booking_status: string;
  fare_paid: number;
  trains: {
    train_number: string;
    train_name: string;
    source_station: string;
    destination_station: string;
    departure_time: string;
    arrival_time: string;
  };
}

const PNRStatus = () => {
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pnr || pnr.length !== 10) {
      toast.error("Please enter a valid 10-digit PNR");
      return;
    }

    try {
      setLoading(true);
      setBooking(null);

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          trains (
            train_number,
            train_name,
            source_station,
            destination_station,
            departure_time,
            arrival_time
          )
        `)
        .eq("pnr", pnr)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error("No booking found with this PNR");
        } else {
          throw error;
        }
        return;
      }

      setBooking(data as any);
      toast.success("Booking found!");
    } catch (error: any) {
      toast.error("Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-8">Check PNR Status</h1>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pnr">Enter 10-Digit PNR Number</Label>
                  <Input
                    id="pnr"
                    type="text"
                    placeholder="e.g., 1234567890"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    className="h-12 text-lg"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  <Search className="h-5 w-5 mr-2" />
                  {loading ? "Searching..." : "Check Status"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {booking && (
            <div className="space-y-6">
              <Card className="border-2 border-primary/20">
                <CardHeader className="bg-primary/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      {booking.booking_status}
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">PNR</p>
                      <p className="text-xl font-bold text-primary">{booking.pnr}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Train className="h-4 w-4" />
                          <span className="text-sm">Train Details</span>
                        </div>
                        <p className="font-semibold text-lg">{booking.trains.train_name}</p>
                        <p className="text-sm text-muted-foreground">#{booking.trains.train_number}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">From</p>
                        <p className="font-semibold">{booking.trains.source_station}</p>
                        <p className="text-sm">{booking.trains.departure_time}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">To</p>
                        <p className="font-semibold">{booking.trains.destination_station}</p>
                        <p className="text-sm">{booking.trains.arrival_time}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm">Passenger Details</span>
                        </div>
                        <p className="font-semibold text-lg">{booking.passenger_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.passenger_age} years • {booking.passenger_gender}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">Journey Date</span>
                        </div>
                        <p className="font-semibold">
                          {new Date(booking.travel_date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Class & Seat</p>
                        <p className="font-semibold">
                          {booking.class.toUpperCase()} - {booking.seat_number}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-sm">Fare Paid</span>
                        </div>
                        <p className="font-semibold text-xl text-primary">₹{booking.fare_paid}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-muted-foreground">
                <p>Please arrive at the station at least 30 minutes before departure</p>
                <p>Carry a valid ID proof for verification</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PNRStatus;
