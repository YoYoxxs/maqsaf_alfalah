import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SchoolAuthProvider } from "./contexts/SchoolAuthContext";
import Welcome from "./pages/Welcome";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import ParentDashboard from "./pages/ParentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import PrincipalDashboard from "./pages/PrincipalDashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Welcome} />
      <Route path={"/menu"} component={Menu} />
      <Route path={"/login/:role"} component={Login} />
      <Route path={"/parent/dashboard"} component={ParentDashboard} />
      <Route path={"/teacher/dashboard"} component={TeacherDashboard} />
      <Route path={"/principal/dashboard"} component={PrincipalDashboard} />
      <Route path={"/404"} component={NotFound} />
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
      <ThemeProvider defaultTheme="light">
        <SchoolAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SchoolAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
