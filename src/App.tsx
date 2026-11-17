import { useContext, useEffect } from "react";
import useRouteElements from "./useRouteElements";
import { AppContext } from "./contexts/app.context";
import { LocalStorageEventTarget } from "./utils/auth";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  const routeElements = useRouteElements();
  const { reset } = useContext(AppContext);

  useEffect(() => {
    LocalStorageEventTarget.addEventListener("clearLS", reset);
    return () => {
      LocalStorageEventTarget.removeEventListener("clearLS", reset);
    };
  }, [reset]);

  return (
    <ErrorBoundary>
      {routeElements}
      <ReactQueryDevtools initialIsOpen={false} />
    </ErrorBoundary>
  );
}

export default App;
