import { Icon } from "@iconify/react";
import { ActionIcon, Text, Tooltip } from "@mantine/core";
import dayjs from "dayjs";
import { useState } from "react";
import { processDate } from "../utils/helpers";

type Props = {
  data: any;
  onClickReply: (data: any) => void;
  onClickRepliedText: (id: string) => void;
  messageOnly: boolean;
};

const MessageBubble: React.FC<Props> = ({
  data,
  onClickReply,
  onClickRepliedText,
  messageOnly = false,
}) => {
  const [hovering, setHovering] = useState(false);
  return (
    <>
      <div
        id={data.id}
        className="relative px-4 hover:bg-zinc-800"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {data?.replying_to && (
          <div className="relative flex gap-2 mb-1 ml-[18px] pl-6 items-center text-zinc-400 before:content-['┌'] before:absolute before:left-0">
            <img
              src={
                data?.replied?.identity?.picture ||
                "https://t4.ftcdn.net/jpg/02/17/34/67/240_F_217346782_7XpCTt8bLNJqvVAaDZJwvZjm0epQmj6j.jpg"
              }
              alt={data?.replied?.identity?.fullname}
              className="w-[20px] h-[20px] rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <Text
              size="sm"
              lineClamp={1}
              className="cursor-pointer hover:text-white"
              onClick={() => onClickRepliedText(data?.replied?.id)}
            >
              {data?.replied?.message}
            </Text>
          </div>
        )}
        <div className="flex items-center gap-2">
          {hovering && (
            <ActionIcon
              variant="transparent"
              className="absolute right-4"
              onClick={() => onClickReply(data)}
            >
              <Icon icon="bi:reply-fill" />
            </ActionIcon>
          )}
          {messageOnly ? (
            <>
              {hovering ? (
                <span className="w-[55px] text-zinc-400 text-xs cursor-default">
                  {dayjs(data.created_at).format("h:mm A")}
                </span>
              ) : (
                <div className="w-[55px]" />
              )}
              <p>{data?.message}</p>
            </>
          ) : (
            <>
              <img
                src={
                  data?.identity?.picture ||
                  "https://t4.ftcdn.net/jpg/02/17/34/67/240_F_217346782_7XpCTt8bLNJqvVAaDZJwvZjm0epQmj6j.jpg"
                }
                alt={data?.identity?.fullname}
                className="w-[45px] h-[45px] mr-[10px] rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <p className="font-semibold ">
                  {data?.identity?.fullname}
                  &nbsp;
                  <Tooltip
                    label={dayjs(data?.created_at).format(
                      "dddd, MMMM D, YYYY h:mm A"
                    )}
                  >
                    <span className="font-normal text-zinc-400 text-sm ml-1 cursor-default">
                      {processDate(data?.created_at)}
                    </span>
                  </Tooltip>
                </p>
                <p>{data?.message}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageBubble;
