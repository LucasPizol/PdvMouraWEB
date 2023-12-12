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
      <RoutesApp />
    </QueryClientProvider>
  );
}

export default App;
