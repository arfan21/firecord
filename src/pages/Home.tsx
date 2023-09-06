import { useContext, useEffect, useRef, useState } from "react";
import MessageList from "../components/MessagesList";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";
import { ActionIcon, Popover, TextInput } from "@mantine/core";
import { Icon } from "@iconify/react";
import { Outlet, useNavigate } from "react-router-dom";
import { Session } from "@ory/client";
import ory from "../configs/ory";
import { useSession } from "../hooks/useSession";
import { useLogoutUrl } from "../hooks/useLogoutUrl";

export const Home = () => {
  const [isLoggedIn, session, setSession] = useSession();
  const [, setLogoutUrl] = useLogoutUrl();

  const navigate = useNavigate();
  const sdkErrorHandler = ory.sdkError(undefined, undefined, "/login");

  const createLogoutFlow = () => {
    // here we create a new logout URL which we can use to log the user out
    ory.frontend
      .createBrowserLogoutFlow(undefined, {
        params: {
          return_url: "/",
        },
        withCredentials: true,
      })
      .then(({ data }) => setLogoutUrl(data.logout_url))
      .catch(sdkErrorHandler);
  };

  useEffect(() => {
    // we check if the user is logged in by checking if there is a session
    // if no session is found, we redirect to the login page
    ory.frontend
      .toSession(undefined, { withCredentials: true })
      .then(({ data: session }) => {
        // we set the session data which contains the user Identifier and other traits.
        console.log(session);
        setSession(session);
        // Set logout flow
        createLogoutFlow();
      })
      .catch(sdkErrorHandler)
      .catch((error) => {
        // Handle all other errors like error.message "network error" if Kratos can not be connected etc.
        if (error.message) {
          return navigate(`/error?error=${encodeURIComponent(error.message)}`, {
            replace: true,
          });
        }

        // Just stringify error and print all data
        navigate(`/error?error=${encodeURIComponent(JSON.stringify(error))}`, {
          replace: true,
        });
      });
  }, []);

  const listRef = useRef<HTMLDivElement>(null);
  const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);
  const [messages, setMessages] = useState<any>([]);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isLoadingFetch, setIsLoadingFetch] = useState<boolean>(false);
  const [isLoadingSend, setIsLoadingSend] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      if (inputValue.length > 0) {
        const data = {
          uid: session?.identity?.id || "",
          photoURL: session?.identity?.traits?.picture || "",
          displayName: session?.identity?.traits?.name?.full || "",
          message: inputValue,
          created_at: new Date().toISOString(),
          replying_to: replyingTo,
        };
        if (replyingTo === null) delete data.replying_to;
        // postMessage(data, setIsLoadingSend);
        setInputValue("");
        setReplyingTo(null);
        listRef.current?.scrollTo(0, listRef.current.scrollHeight);
      }
      return;
    } else {
      setIsOpenPopover(true);
      setTimeout(() => {
        setIsOpenPopover(false);
      }, 4000);
    }
  };

  return (
    <>
      <Navbar />
      <Outlet />
      <MessageList
        data={messages}
        isLoading={isLoadingFetch}
        setReplyingTo={setReplyingTo}
        ref={listRef}
      />

      {/* Message Input */}
      <form className="absolute bottom-0 w-full" onSubmit={handleSubmit}>
        {replyingTo !== null && (
          <div className="flex justify-between items-center mx-auto w-[99%] rounded-t-lg py-2 px-3 bg-zinc-800">
            <p className="text-sm">
              Replying to&nbsp;
              <span className="font-bold">{replyingTo.displayName}</span>
            </p>
            <ActionIcon
              size="sm"
              variant="transparent"
              onClick={() => setReplyingTo(null)}
            >
              <Icon icon="ant-design:close-circle-filled" />
            </ActionIcon>
          </div>
        )}
        <div className="w-full flex gap-2 p-5">
          <Popover opened={isOpenPopover} onChange={setIsOpenPopover}>
            <Popover.Target>
              <TextInput
                placeholder="Write something here"
                className="w-full"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </Popover.Target>
            <Popover.Dropdown className="text-red-500">
              You must be signed in to send message
            </Popover.Dropdown>
          </Popover>
          <ActionIcon
            type="submit"
            size="lg"
            variant="transparent"
            loading={isLoadingSend}
          >
            <Icon icon="bi:send-fill" />
          </ActionIcon>
        </div>
      </form>
    </>
  );
};
