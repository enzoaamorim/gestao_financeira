import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext";
import { WorkoutProvider } from "./context/WorkoutContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import { AppLayout } from "./components/layout/AppLayout";
import { FitnessLayout } from "./components/layout/FitnessLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Goals from "./pages/Goals";
import Categories from "./pages/Categories";
import Settings from "./pages/Settings";
import FitnessDashboard from "./pages/fitness/FitnessDashboard";
import LogWorkout from "./pages/fitness/LogWorkout";
import Routines from "./pages/fitness/Routines";
import Exercises from "./pages/fitness/Exercises";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/configuracoes"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <FinanceProvider>
                <AppLayout />
              </FinanceProvider>
            </RequireAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="transacoes" element={<Transactions />} />
          <Route path="contas" element={<Accounts />} />
          <Route path="metas" element={<Goals />} />
          <Route path="categorias" element={<Categories />} />
        </Route>
        <Route
          path="/treino"
          element={
            <RequireAuth>
              <WorkoutProvider>
                <FitnessLayout />
              </WorkoutProvider>
            </RequireAuth>
          }
        >
          <Route index element={<FitnessDashboard />} />
          <Route path="registrar" element={<LogWorkout />} />
          <Route path="rotinas" element={<Routines />} />
          <Route path="exercicios" element={<Exercises />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
