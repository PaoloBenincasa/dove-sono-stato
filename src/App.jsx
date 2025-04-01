import { RouterProvider } from "react-router";
import router from "./routes/Routes";
import SessionContextProvider from "./context/SessionContextProvider";
import CollectionsContextProvider from "./context/CollectionsContextProvider";
import SearchContextProvider  from "./context/SearchContextProvider";
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <div className="vh-100">
      <RouterProvider router={router} />
      <ToastContainer position="bottom-right"
                            autoClose={2000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick={true}
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="light"
                        />

    </div>
  )
}

function Root() {
  return (
    <SessionContextProvider>
      <CollectionsContextProvider>
        <SearchContextProvider>
          <App />
        </SearchContextProvider>
      </CollectionsContextProvider>
    </SessionContextProvider>
  )
}

export default Root;
