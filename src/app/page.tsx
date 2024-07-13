"use client";

import { useActions, useUIState } from "ai/rsc";
import { FieldValues, useForm } from "react-hook-form";
import type { AI, ClientMessage } from "./actions";

export default function Page() {
  const { sendMessage } = useActions<typeof AI>();
  const [messages, setMessages] = useUIState<typeof AI>();

  const formMethods = useForm();

  const { register, handleSubmit } = formMethods;

  const submit = async (data: FieldValues) => {
    try {
      if (!data.message) return;

      setMessages(currentMessages => [
        ...currentMessages,
        {
          id: Date.now(),
          role: "user",
          display: <div>{data.message}</div>,
        },
      ]);

      const responseMessage = await sendMessage(data.message);

      setMessages(currentMessages => [...currentMessages, responseMessage]);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <ul>
        {messages.map((message: ClientMessage) => (
          <li key={message.id}>{message.display}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit(submit)}>
        <input type="text" {...register("message")} />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
