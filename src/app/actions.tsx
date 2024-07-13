"use server";

import { openai } from "@ai-sdk/openai";
import { CoreMessage, ToolInvocation } from "ai";
import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { ReactNode } from "react";
import { z } from "zod";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getTestAPI = async (storeName: string) => {
  // 여기서 API 호출하면 될듯함.
  await sleep(2000);
  return {
    title: storeName,
    description: `this is ${storeName} store description!!!`,
  };
};

const LoadingComponent = () => (
  <div className="animate-pulse p-4">Loading...</div>
);

const content = `\
You are a store information bot and you can help users find out details about stores.

A message inside means a UI element or user event. For example:

"[Store info = Walmart]" means that you want to show the user the information interface for Walmart.

// If the user wants information about all stores, call \`getAllStore\` to display the information.

If the user wants detailed information about a particular store, call \`getDetailStore\` to display the details.
If a user wants information that isn't related to your store, then tell them not to ask questions that aren't related to your store.

In addition to getting store information, you can also chat with users.
`;

// Define the AI state and UI state types
export type ServerMessage = {
  id?: number;
  name?: "getAllStore" | "getDetailStore";
  role: "user" | "assistant" | "system";
  content: string;
};

export type ClientMessage = {
  id: number;
  role: "user" | "assistant";
  display: ReactNode;
  toolInvocations?: ToolInvocation[];
};

export const sendMessage = async (message: string): Promise<ClientMessage> => {
  "use server";
  const history = getMutableAIState<typeof AI>();

  history.update([
    ...history.get(),
    {
      role: "user",
      content: message,
    },
  ]);

  const reply = await streamUI({
    model: openai("gpt-3.5-turbo"),
    messages: [
      {
        role: "system",
        content,
        toolInvocations: [],
      },
      ...history.get(),
    ] as CoreMessage[],
    initial: <LoadingComponent />,
    text: ({ content, done }) => {
      if (done)
        history.done([...history.get(), { role: "assistant", content }]);

      return <div>{content}</div>;
    },
    tools: {
      getDetailStore: {
        description:
          "Gets information about the given store. Use it to provide users with store information.",
        parameters: z.object({
          storeName: z.string().describe("The storeName is required."),
        }),
        generate: async function* ({ storeName }: { storeName: string }) {
          yield <LoadingComponent />;

          const store = await getTestAPI(storeName);

          const storeTitle = store.title;
          const storeDescription = store.description;

          await sleep(1000);

          history.done([
            ...history.get(),
            {
              role: "assistant",
              content: `[Store info = ${storeTitle}]`,
            },
          ]);

          return <div>{storeDescription}</div>;
        },
      },
    },
    temperature: 0,
  });

  return {
    id: Date.now(),
    role: "assistant",
    display: reply.value,
  };
};

export type AIState = Array<ServerMessage>;
export type UIState = Array<ClientMessage>;

// Create the AI provider with the initial states and allowed actions
export const AI = createAI({
  initialAIState: [] as AIState,
  initialUIState: [] as UIState,
  actions: {
    sendMessage,
  },
});
