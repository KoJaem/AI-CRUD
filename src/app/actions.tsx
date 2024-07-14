"use server";

import { openai } from "@ai-sdk/openai";
import { CoreMessage, ToolInvocation } from "ai";
import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { ReactNode } from "react";
import { z } from "zod";
import {
  createItem,
  deleteItem,
  getItem,
  getItems,
} from "./supabaseAuth/actions";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStoreListAPI = async () => {
  try {
    await sleep(2000);
    const response = await getItems();
    console.log("response list", response);

    return response;
  } catch (error) {
    console.log(error);
  }
};
const getStoreDetailAPI = async (storeName: string) => {
  try {
    await sleep(2000);
    const response = await getItem(storeName);
    console.log("response detail", response);
    return Array.isArray(response) && response.length > 0
      ? response[0]
      : undefined;
  } catch (error) {
    console.log(error);
  }
};

const postStoreAPI = async (
  storeName: string,
  description: string,
  content: string
) => {
  try {
    await sleep(2000);
    const response = await createItem(storeName, description, content);
    console.log("response post", response);
    return {
      title: storeName,
      description,
      content,
    };
  } catch (error) {
    console.log(error);
  }
};

// Todo 추 후 해당데이터가 있는지 확인 후 권한이 있는경우에 삭제 / 데이터가 없거나 권한이 없는경우 에러처리 해야함
const deleteStoreAPI = async (storeName: string) => {
  try {
    await sleep(2000);

    const target = await getStoreDetailAPI(storeName);

    console.log("target.id", target.id);

    const response = await deleteItem(target.id);

    console.log("response delete", response);

    return {
      title: storeName,
    };
  } catch (error) {
    console.log(error);
  }
};

const LoadingComponent = () => (
  <div className="animate-pulse p-4">Loading...</div>
);

const content = `\
You are a store information bot and you can help users find out details about stores.

A message inside means a UI element or user event. Don't use this directly as an answer. For example:

"[Store Info = KoJaemMart]" means that you want to show the user the information interface for KoJaemMart.

"[Store List]" means that you want to display list data to provide users with overall store information.

"[Store Post = KoJaemMart]" means that you want to provide users with the function to create store for KoJaemMart.

"[Store Delete = KoJaemMart]" means that you want to provide users the function to delete store for KoJaemMart.

If the user wants information about all stores, call \`getAllStore\` to display the information.

If the user wants detailed information about a particular store, call \`getDetailStore\` to display the details.

If the user wants to create a store, first, receive the values storeName, description, content from the user. and call \`postStore\` to create the store.

If a user wants to delete a store, first, receive the storeName value from the user and call \`deleteStore\` to delete the store.

In addition to getting store information, you can also chat with users.
`;

// Define the AI state and UI state types
export type ServerMessage = {
  id?: number;
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
    text: async ({ content, done }) => {
      if (done)
        history.done([...history.get(), { role: "assistant", content }]);
      // tool 을 사용하지않고 텍스트를 반환하는 부분
      await sleep(2000);
      console.log("Tool is not used");
      return <div>{content}</div>;
    },
    tools: {
      getAllStore: {
        description:
          "Gets the store listing information. Use it to provide users with overall store information.",
        parameters: z.object({}),
        generate: async function* () {
          yield <LoadingComponent />;

          const list = await getStoreListAPI();

          await sleep(1000);

          history.done([
            ...history.get(),
            {
              role: "assistant",
              content: `[Store List]`,
            },
          ]);

          return (
            <div>
              {list?.map(data => (
                <div key={`store-${data.id}`} className="py-4">
                  <h1 className="text-[20px] font-bold">{data.title}</h1>
                  <p className="text-[20px] font-bold">{data.description}</p>
                </div>
              ))}
            </div>
          );
        },
      },

      getDetailStore: {
        description:
          "Gets information about the specific store. Use it to provide users with specific store information.",
        parameters: z.object({
          storeName: z.string().describe("The storeName of the store"),
        }),
        generate: async function* ({ storeName }: { storeName: string }) {
          yield <LoadingComponent />;

          const store = await getStoreDetailAPI(storeName);

          const storeTitle = store?.title;
          const storeDescription = store?.description;

          await sleep(1000);

          history.done([
            ...history.get(),
            {
              role: "assistant",
              content: `[Store Info = ${storeTitle}]`,
            },
          ]);

          return (
            <div>
              {store?.map(data => (
                <div key={`store-${data.id}`} className="py-4">
                  <h1 className="text-[20px] font-bold">{data.title}</h1>
                  <p className="text-[20px] font-bold">{data.description}</p>
                  <p className="text-[20px] font-bold">{data.content}</p>
                </div>
              ))}
            </div>
          );
        },
      },

      postStore: {
        description:
          "Creates a store. Use if the user wants to create a store.",
        parameters: z.object({
          storeName: z.string().describe("The storeName of the store"),
          description: z
            .string()
            .describe("The store description of the store"),
          content: z.string().describe("The store content of the store"),
        }),
        generate: async function* ({
          storeName,
          description,
          content,
        }: {
          storeName: string;
          description: string;
          content: string;
        }) {
          yield <LoadingComponent />;

          const store = await postStoreAPI(storeName, description, content);

          const storeTitle = store.title;
          const storeDescription = store.description;
          const storeContent = store.content;

          await sleep(1000);

          history.done([
            ...history.get(),
            {
              role: "assistant",
              content: `[Store Post = ${storeName}]`,
            },
          ]);

          return (
            <div>
              <h1 className="text-[20px] font-bold">{storeTitle}-생성됨</h1>
              <p>{storeDescription}</p>
              <p>{storeContent}</p>
            </div>
          );
        },
      },
      deleteStore: {
        description:
          "Delete data for a specific store. Use if the user wants to delete a specific store.",
        parameters: z.object({
          storeName: z.string().describe("The storeName of the store"),
        }),
        generate: async function* ({ storeName }: { storeName: string }) {
          yield <LoadingComponent />;

          const store = await deleteStoreAPI(storeName);

          const storeTitle = store?.title;

          await sleep(1000);

          history.done([
            ...history.get(),
            {
              role: "assistant",
              content: `[Store Delete = ${storeTitle}]`,
            },
          ]);

          return <div>{storeTitle}-삭제됨</div>;
        },
      },
    },
    toolChoice: "required",
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
