import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout components
import { Header } from "./components/Layout/Header";
import { BottomNav } from "./components/Layout/BottomNav";

// Pages
import { Home } from "./pages/Home";
import { Pay } from "./pages/Pay";
import { SplitBill } from "./pages/SplitBill";
import { Save } from "./pages/Save";
import { Chat } from "./pages/Chat";
import { Activity } from "./pages/Activity";
import { Community } from "./pages/Community";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ShardPay = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-center" richColors closeButton visibleToasts={5} />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pay" element={<Pay />} />
              <Route path="/split" element={<SplitBill />} />
              <Route path="/save" element={<Save />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/community" element={<Community />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default ShardPay;