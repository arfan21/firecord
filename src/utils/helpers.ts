import dayjs from "dayjs";

export const processDate = (date: string, detailed = true) => {
  const dateNow = dayjs();
  const dateMessage = dayjs(date);
  const formattedDate = dateMessage.format("h:mm A");
  const detailedString = detailed ? `at ${formattedDate}` : "";
  if (dateNow.diff(dateMessage, "day") === 0) {
    return `Today ${detailedString}`;
  }
  if (dateNow.diff(dateMessage, "day") === 1) {
    return `Yesterday ${detailedString}`;
  }
  return dateMessage.format("DD/MM/YYYY");
};
