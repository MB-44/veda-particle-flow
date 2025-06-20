import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Scenes
import Scene1 from "./pages/forestVeda/Scene1";
import Scene2 from "./pages/forestVeda/Scene2";
import Scene3 from "./pages/forestVeda/Scene3";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* forestVeda routes */}
          <Route path="/forestVeda/Scene1" element={<Scene1 />} />
          <Route path="/forestVeda/Scene2" element={<Scene2 />} />
          <Route path="/forestVeda/Scene3" element={<Scene3 />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
