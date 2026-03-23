import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ChatSelection from "./pages/ChatSelection";
import TextChat from "./pages/TextChat";
import VoiceChat from "./pages/VoiceChat";
import Analysis from "./pages/Analysis";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Collaborate from "./pages/Collaborate";
import CollaborativeChat from "./pages/CollaborativeChat";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignUp /></PageTransition>} />
        <Route path="/signin" element={<PageTransition><SignIn /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/analysis" element={<PageTransition><Analysis /></PageTransition>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute><PageTransition><ChatSelection /></PageTransition></ProtectedRoute>} />
        <Route path="/text-chat" element={<ProtectedRoute><PageTransition><TextChat /></PageTransition></ProtectedRoute>} />
        <Route path="/voice-chat" element={<ProtectedRoute><PageTransition><VoiceChat /></PageTransition></ProtectedRoute>} />
        <Route path="/collaborate" element={<ProtectedRoute><PageTransition><Collaborate /></PageTransition></ProtectedRoute>} />
        <Route path="/collaborate/:sessionId" element={<ProtectedRoute><PageTransition><CollaborativeChat /></PageTransition></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><PageTransition><Profile /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="iare-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
