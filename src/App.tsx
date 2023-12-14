import { AuthProvider } from "./context/AuthProvider";
import { RoutesApp } from "./routes";
import "./styles/default.module.scss";
import "./styles/styles.css";

import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoutesApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
