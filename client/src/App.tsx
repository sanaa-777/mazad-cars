import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/HomeNew";
import Auctions from "./pages/Auctions";
import Listings from "./pages/Listings";
import ListingIdRoute from "./pages/ListingIdRoute";
import NewListing from "./pages/NewListing";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Admin from "./pages/Admin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/auctions"} component={Auctions} />
      <Route path={"/listings"} component={Listings} />
      <Route path={"/listings/new"} component={NewListing} />
      <Route path={"/listings/:id"} component={ListingIdRoute} />
      <Route path={"/messages"} component={Messages} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/notifications"} component={Notifications} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
