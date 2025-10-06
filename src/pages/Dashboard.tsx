import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Ticket, Calendar, Train as TrainIcon } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Booking {
  id: string;
  pnr: string;
  passenger_name: string;
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
  };
}

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to view your dashboard");
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await Promise.all([fetchProfile(session.user.id), fetchBookings(session.user.id)]);
    } catch (error: any) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Profile fetch error:", error);
      return;
    }

    setProfile(data);
  };

  const fetchBookings = async (userId: string) => {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        trains (
          train_number,
          train_name,
          source_station,
          destination_station,
          departure_time
        )
      `)
      .eq("user_id", userId)
      .order("booking_date", { ascending: false });

    if (error) {
      console.error("Bookings fetch error:", error);
      toast.error("Failed to load bookings");
      return;
    }

    setBookings(data as any);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">My Dashboard</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.full_name || "User"}</div>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {bookings.filter(b => new Date(b.travel_date) >= new Date()).length}
              </div>
              <p className="text-xs text-muted-foreground">Future journeys</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Bookings</h2>
            <Button onClick={() => navigate("/")}>
              Book New Ticket
            </Button>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <TrainIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your journey by booking your first ticket
                </p>
                <Button onClick={() => navigate("/")}>
                  Search Trains
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <TrainIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{booking.trains.train_name}</h3>
                            <p className="text-sm text-muted-foreground">#{booking.trains.train_number}</p>
                          </div>
                          <Badge variant={booking.booking_status === "Confirmed" ? "default" : "secondary"}>
                            {booking.booking_status}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">From</p>
                            <p className="font-semibold">{booking.trains.source_station}</p>
                            <p className="text-xs">{booking.trains.departure_time}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">To</p>
                            <p className="font-semibold">{booking.trains.destination_station}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Journey Date</p>
                            <p className="font-semibold">
                              {new Date(booking.travel_date).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="md:text-right space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">PNR</p>
                          <p className="font-bold text-lg text-primary">{booking.pnr}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Seat</p>
                          <p className="font-semibold">{booking.seat_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fare</p>
                          <p className="font-semibold">₹{booking.fare_paid}</p>
                        </div>
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

export default Dashboard;
