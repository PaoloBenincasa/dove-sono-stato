import { RouterProvider } from "react-router";
import router from "./routes/Routes";
import SessionContextProvider from "./context/SessionContextProvider";
import CollectionsContextProvider from "./context/CollectionsContextProvider";

function App() {
  return (
    <div className="vh-100">
      <RouterProvider router={router} />
    </div>
  )
}

function Root() {
  return (
    <SessionContextProvider>
      <CollectionsContextProvider>
        <App />
      </CollectionsContextProvider>
    </SessionContextProvider>
  )
}

export default Root;
