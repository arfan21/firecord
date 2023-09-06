import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { ModalLogin } from "./components/ModalLogin";
import { ModalRegister } from "./components/ModalRegister";
// import { getMessages, postMessage } from "./network/firebase";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      children: [
        {
          path: "login",
          element: <ModalLogin />,
        },
        {
          path: "registration",
          element: <ModalRegister />,
        },
      ],
    },
    {
      path: "/test",
      element: <div>Test</div>,
    },
  ]);

  return <RouterProvider router={router}></RouterProvider>;

  // <Routes>
  //       <Route path="/" element={<Home />}>
  //         {/* <Route
  //         path="login"
  //         element={
  //           <ModalAuth opened={opened} close={close} isLoading={false} />
  //         }
  //       /> */}
  //       </Route>
  //     </Routes>
};

export default App;
