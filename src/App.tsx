import { Icon } from "@iconify/react";
import { ActionIcon, Popover, TextInput } from "@mantine/core";
import { useContext, useEffect, useRef, useState } from "react";
import MessageList from "./components/MessagesList";
import Navbar from "./components/Navbar";
import { AuthContext } from "./context/AuthContext";
import { useIsLoggedIn } from "./hooks/useIsLoggedIn";
import { getMessages, postMessage } from "./network/firebase";

const App = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);
  const [messages, setMessages] = useState<any>([]);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isLoadingFetch, setIsLoadingFetch] = useState<boolean>(false);
  const [isLoadingSend, setIsLoadingSend] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");
  const { user } = useContext(AuthContext);
  const isLoggedIn = useIsLoggedIn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      if (inputValue.length > 0) {
        const data = {
          uid: user?.uid,
          photoURL: user?.photoURL,
          displayName: user?.displayName,
          message: inputValue,
          created_at: new Date().toISOString(),
          replying_to: replyingTo,
        };
        if (replyingTo === null) delete data.replying_to;
        postMessage(data, setIsLoadingSend);
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

  useEffect(() => {
    getMessages(setIsLoadingFetch, (data: any) => {
      if (data) {
        const newMessages = Object.keys(data).map((key: string) => {
          return {
            key,
            ...data[key],
          };
        });
        setMessages(newMessages);
      }
      setIsLoadingFetch(false);
    });
  }, []);

  return (
    <>
      <Navbar />
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

export default App;
