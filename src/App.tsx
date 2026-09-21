import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext";
import { RequireAuth } from "./components/auth/RequireAuth";
import { AppLayout } from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Goals from "./pages/Goals";
import Categories from "./pages/Categories";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
      </Routes>
    </AuthProvider>
  );
}

export default App;
