import "./App.css";
import { RoutesApp } from "./routes";

import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoutesApp />
    </QueryClientProvider>
  );
}

export default App;
