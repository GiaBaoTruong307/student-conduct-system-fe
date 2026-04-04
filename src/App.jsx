import AppRoutes from "./routes";
import { ScoreProvider } from "./context/ScoreContext";

function App() {
  return (
    <ScoreProvider>
      <AppRoutes />
    </ScoreProvider>
  );
}

export default App;