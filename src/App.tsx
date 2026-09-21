import { Routes, Route } from "react-router-dom";
import { FinanceProvider } from "./context/FinanceContext";
import { AppLayout } from "./components/layout/AppLayout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Goals from "./pages/Goals";

function App() {
  return (
    <FinanceProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transacoes" element={<Transactions />} />
          <Route path="contas" element={<Accounts />} />
          <Route path="metas" element={<Goals />} />
        </Route>
      </Routes>
    </FinanceProvider>
  );
}

export default App;
