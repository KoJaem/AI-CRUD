"use server";

import { createClient } from "@/utils/supabase/server";

export async function getItems() {
  const supabase = createClient();
  const { data } = await supabase.from("stores").select("*").limit(10);
  return data;
}

export async function getItem(title: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("title", title)
    .limit(10);
  return data;
}

export async function createItem(
  title: string,
  description: string,
  content: string
) {
  const supabase = createClient();

  const { error } = await supabase.from("stores").insert([
    {
      title,
      description,
      content,
    },
  ]);

  if (error) {
    return false;
  }

  return true;
}

export async function updateItem(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("stores")
    .update({
      title: prompt("title?"),
      description: prompt("description?"),
      content: prompt("description?"),
    })
    .eq("id", id);

  if (error) {
    return false;
  }

  return true;
}

export async function deleteItem(id: number) {
  const supabase = createClient();

  const { error } = await supabase.from("stores").delete().eq("id", id);

  console.log("error", error);
  if (error) {
    return false;
  }

  return true;
}
