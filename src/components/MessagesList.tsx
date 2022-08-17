import { Divider } from "@mantine/core";
import dayjs from "dayjs";
import { forwardRef, Fragment } from "react";
import { processDate } from "../utils/helpers";
import MessageBubble from "./MessageBubble";
import MessageBubbleSkeleton from "./MessageBubbleSkeleton";
import styles from "./MessageList.module.css";

type Props = {
  data: any;
  isLoading: boolean;
  setReplyingTo: (data: any) => void;
};

const MessageList = forwardRef<HTMLDivElement, Props>(
  ({ data, isLoading, setReplyingTo }: Props, ref) => {
    const handleClickRepliedText = (id: string) => {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.classList.add(styles.animatePulseFast);
      setTimeout(() => {
        element?.classList.remove(styles.animatePulseFast);
      }, 1000);
    };
    return (
      <div
        className="flex flex-col py-4 overflow-y-scroll scroll-smooth max-h-[calc(100vh-161px)]"
        ref={ref}
      >
        {(() => {
          if (isLoading) {
            return Array.from(Array(10).keys()).map((_, i) => (
              <MessageBubbleSkeleton key={i} />
            ));
          }
          if (data.length > 0) {
            return data.map((item: any, i: number) => {
              const hasOneDayDiff =
                dayjs(item?.created_at).diff(data[i - 1]?.created_at, "day") >=
                1;
              const isSameUser = data[i - 1]?.uid === item?.uid;
              const hasLess20MinDiff = (dateFirst: string, dateTwo: string) => {
                return dayjs(dateFirst).diff(dateTwo, "minute") < 20;
              };
              const messageOnly =
                !item.replying_to &&
                isSameUser &&
                hasLess20MinDiff(data[i + 1]?.created_at, item?.created_at) &&
                hasLess20MinDiff(item?.created_at, data[i - 1]?.created_at);

              return (
                <Fragment key={item.key}>
                  {(i === 0 || hasOneDayDiff) && (
                    <Divider
                      my="xs"
                      label={processDate(item.created_at, false)}
                      labelPosition="center"
                      className="text-zinc-400 cursor-default"
                    />
                  )}
                  <div className={messageOnly ? "" : "mt-6"}>
                    <MessageBubble
                      data={item}
                      messageOnly={messageOnly}
                      onClickRepliedText={handleClickRepliedText}
                      onClickReply={setReplyingTo}
                    />
                  </div>
                </Fragment>
              );
            });
          }
          return (
            <p className="text-center text-zinc-500">Nothing to see here</p>
          );
        })()}
      </div>
    );
  }
);

export default MessageList;
