import { Icon } from "@iconify/react";
import { ActionIcon, Popover, TextInput } from "@mantine/core";
import { useContext, useEffect, useRef, useState } from "react";
import MessageList from "./components/MessagesList";
import Navbar from "./components/Navbar";
import { AuthContext } from "./context/AuthContext";
import { useIsLoggedIn } from "./hooks/useIsLoggedIn";
import {
  Route,
  RouterProvider,
  Routes,
  createBrowserRouter,
} from "react-router-dom";
import { Home } from "./pages/Home";
import { ModalAuth } from "./components/ModalAuth";
import { useDisclosure } from "@mantine/hooks";
// import { getMessages, postMessage } from "./network/firebase";

const App = () => {
  // useEffect(() => {
  //   getMessages(setIsLoadingFetch, (data: any) => {
  //     if (data) {
  //       const newMessages = Object.keys(data).map((key: string) => {
  //         return {
  //           key,
  //           ...data[key],
  //         };
  //       });
  //       setMessages(newMessages);
  //     }
  //     setIsLoadingFetch(false);
  //   });
  // }, []);

  const [opened, { open, close }] = useDisclosure(true);
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
      children: [
        {
          path: "login",
          element: <ModalAuth opened={true} close={close} isLoading={false} />,
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
