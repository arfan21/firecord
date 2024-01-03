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
import useWebSocket, { ReadyState } from "react-use-websocket";
import { apiConfig } from "../configs/api";
import { set } from "firebase/database";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import { getMessages } from "../network/api";
import axios from "axios";

type WSRequest = {
  status: number;
  action: WSAction;
  data: any;
};

type IdentityData = {
  id: string;
  picture: string;
  fullname: string;
};

enum WSAction {
  Message = "message",
  Typing = "typing",
  Connected = "connected",
  Disconnected = "disconnected",
}

type Message = {
  id: string | null;
  uid: string;
  identity: {
    picture: string;
    fullname: string;
  };
  message: string;
  created_at: string;
  replying_to: any | null;
  replied: Message | null;
};

const ERROR_AUTH_MESSAGE = "You must be signed in to send message";
const ERROR_CONNECTION_MESSAGE =
  "You must be connected to send message, check your internet connection";
const ERROR_SOMETHING_WRONG_MESSAGE = "Something went wrong";
const ERROR_BAD_REQUEST_MESSAGE = "Bad request";

export const Home = () => {
  const [isLoggedIn, session, setSession] = useSession();
  const [, setLogoutUrl] = useLogoutUrl();

  const navigate = useNavigate();
  const sdkErrorHandler = ory.sdkError(undefined, undefined, "/");

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
    if (window.location.pathname !== "/") return;

    ory
      .toSession()
      .then(async ({ data: session }) => {
        // we set the session data which contains the user Identifier and other traits.
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

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `${apiConfig.wsURL}?token=${session?.tokenized}`, undefined, session?.tokenized !== undefined
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  useEffect(() => {
    if (readyState === ReadyState.CLOSED && isLoggedIn) {
      setErrorMessage(ERROR_CONNECTION_MESSAGE);
      setIsOpenPopover(true);
    } else {
      setErrorMessage(ERROR_AUTH_MESSAGE);
      setIsOpenPopover(false);
    }
  }, [readyState]);

  const listRef = useRef<HTMLDivElement>(null);
  const refIsScrolledBottom = useRef<boolean>(false);
  const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isLoadingFetch, setIsLoadingFetch] = useState<boolean>(false);
  const [isLoadingSend, setIsLoadingSend] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const [identitiesTyping, setIdentitiesTyping] = useState<IdentityData[]>([]);
  const [errorMessage, setErrorMessage] = useState(ERROR_AUTH_MESSAGE);

  useEffect(() => {
    getMessages(setIsLoadingFetch, (data: any) => {
      console.log(data);
      setMessages(data?.data || []);
      setIsLoadingFetch(false);
      refIsScrolledBottom.current = true;
    });
  }, []);

  useEffect(() => {
    if (listRef.current && refIsScrolledBottom.current) {
      let bottom =
        listRef.current?.scrollHeight - listRef.current?.clientHeight;
      let position = listRef.current?.scrollTop;
      listRef.current.scrollTop = bottom + 16;
    }
  }, [messages]);

  const debounceDeleteIdentitiesTyping = useDebouncedCallback(
    (identity: IdentityData, identitiesTyping: IdentityData[]) => {
      let newIdentitiesTyping = identitiesTyping.filter(
        (item) => item.id !== identity.id
      );
      setIdentitiesTyping(newIdentitiesTyping);
    },
    3000
  );

  const addMessage = (
    data: any,
    identity: IdentityData,
    isConnected: boolean = false
  ) => {
    let message = data?.message || "";

    if (!isConnected) {
      // remove typing identity
      let existTyping = identitiesTyping.find(
        (item) => item.id === identity.id
      );
      if (existTyping) {
        debounceDeleteIdentitiesTyping.cancel();
        setIdentitiesTyping((prev) => [
          ...prev.filter((item) => item.id !== identity.id),
        ]);
      }
    } else {
      message = `${identity?.fullname} has joined the chat`;

      let exist = messages.find((item) => {
        if (item.uid === identity.id) {
          if (
            new Date().getTime() - new Date(item.created_at).getTime() <
            60000
          ) {
            return true;
          }
        }
        return false;
      });

      if (exist) return;
    }

    setMessages((messages) => {
      if (listRef.current) {
        let bottom =
          listRef.current?.scrollHeight - listRef.current?.clientHeight;
        let position = listRef.current?.scrollTop;

        let isBottom = bottom <= position + 16;
        refIsScrolledBottom.current = isBottom;
      }
      return [
        ...messages,
        {
          id: data?.id || null,
          uid: identity?.id || "",
          identity: {
            fullname: identity?.fullname || "",
            picture: identity?.picture || "",
          },
          message: message,
          created_at: new Date().toISOString(),
          replying_to: data?.replying_to || null,
          replied: data?.replied || null,
        },
      ];
    });
  };

  const addTypingIdentity = (typingIdentity: IdentityData) => {
    let existTyping = identitiesTyping.find(
      (item) => item.id === typingIdentity.id
    );
    if (!existTyping) {
      setIdentitiesTyping((prev) => [...prev, typingIdentity]);
      debounceDeleteIdentitiesTyping.cancel();
      debounceDeleteIdentitiesTyping(typingIdentity, [
        ...identitiesTyping,
        typingIdentity,
      ]);
    }
  };

  useEffect(() => {
    let timeoutId: any = null;
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data) as WSRequest;
      if (data.status !== 200) {
        if (data.status >= 400 && data.status < 500) {
          setErrorMessage(ERROR_BAD_REQUEST_MESSAGE);
          setIsOpenPopover(true);
          timeoutId = setTimeout(() => {
            setIsOpenPopover(false);
            setErrorMessage(ERROR_AUTH_MESSAGE);
          }, 4000);
        }
        if (data.status >= 500) {
          setErrorMessage(ERROR_CONNECTION_MESSAGE);
          setIsOpenPopover(true);
          timeoutId = setTimeout(() => {
            setIsOpenPopover(false);
            setErrorMessage(ERROR_AUTH_MESSAGE);
          }, 4000);
        }

        return;
      }

      switch (data.action) {
        case WSAction.Message:
          console.log(data);
          let identity = data.data?.identity as IdentityData;
          console.log(identity);
          addMessage(data.data, identity, false);
          break;
        case WSAction.Connected:
          let identityConnected = data.data as IdentityData;
          addMessage(null, identityConnected, true);
          break;

        case WSAction.Typing:
          let identityTyping = data.data as IdentityData;
          addTypingIdentity(identityTyping);
          break;
      }
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [lastMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      if (inputValue.length > 0) {
        sendMessage(
          JSON.stringify({
            action: WSAction.Message,
            data: {
              message: inputValue,
              replying_to: replyingTo?.id || null,
            },
          })
        );
        setInputValue("");
        setReplyingTo(null);
        debouncedTyping.cancel();
      }
      return;
    } else {
      setIsOpenPopover(true);
      setTimeout(() => {
        setIsOpenPopover(false);
      }, 4000);
    }
  };

  const debouncedTyping = useDebouncedCallback(
    () => {
      console.log("sending message");
      sendMessage(JSON.stringify({ action: WSAction.Typing }));
    },
    500,
    { leading: true, trailing: false }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debouncedTyping();
  };

  const [labelTyping, setLabelTyping] = useState<string>("");

  useEffect(() => {
    if (identitiesTyping.length > 0) {
      if (identitiesTyping.length > 1) {
        setLabelTyping(
          `${identitiesTyping[0].fullname} & others people is typing...`
        );
      } else {
        setLabelTyping(`${identitiesTyping[0].fullname} is typing...`);
      }
    } else {
      setLabelTyping("");
    }
  }, [identitiesTyping]);

  return (
    <div className="w-full h-screen relative ">
      {/* <div>
        <p>Connection Status: {connectionStatus}</p>
      </div> */}
      <Navbar readyState={readyState} />
      <Outlet />
      <MessageList
        replyingTo={replyingTo}
        data={messages}
        isLoading={isLoadingFetch}
        setReplyingTo={setReplyingTo}
        ref={listRef}
      />

      {/* Message Input */}
      <form className=" w-full absolute bottom-0" onSubmit={handleSubmit}>
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
          <div className="w-full">
            <p className="text-sm py-1">{labelTyping}</p>
            <Popover
              opened={isOpenPopover}
              onChange={setIsOpenPopover}
              closeOnClickOutside={errorMessage !== ERROR_CONNECTION_MESSAGE}
            >
              <Popover.Target>
                <TextInput
                  placeholder="Write something here"
                  className="w-full"
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={errorMessage === ERROR_CONNECTION_MESSAGE}
                />
              </Popover.Target>
              <Popover.Dropdown className="text-red-500">
                {errorMessage}
              </Popover.Dropdown>
            </Popover>
          </div>

          <div className={labelTyping ? "pt-7" : "pt-2"}>
            <ActionIcon
              type="submit"
              size="lg"
              variant="transparent"
              loading={isLoadingSend}
              disabled={errorMessage === ERROR_CONNECTION_MESSAGE}
            >
              <Icon icon="bi:send-fill" />
            </ActionIcon>
          </div>
        </div>
      </form>
    </div>
  );
};
