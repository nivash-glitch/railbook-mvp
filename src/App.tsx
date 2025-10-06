import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchTrains from "./pages/SearchTrains";
import Auth from "./pages/Auth";
import TrainList from "./pages/TrainList";
import BookTrain from "./pages/BookTrain";
import PNRStatus from "./pages/PNRStatus";
import TrainStatus from "./pages/TrainStatus";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SearchTrains />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/trains" element={<TrainList />} />
          <Route path="/book" element={<BookTrain />} />
          <Route path="/pnr-status" element={<PNRStatus />} />
          <Route path="/train-status" element={<TrainStatus />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
