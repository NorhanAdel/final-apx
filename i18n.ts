import {getRequestConfig} from "next-intl/server";

export default getRequestConfig(async () => ({
  locale: "en",
  messages: (await import("./app/messages/en.json")).default
}));