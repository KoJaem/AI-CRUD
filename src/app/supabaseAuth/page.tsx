import { revalidatePath } from "next/cache";
import { createItem, deleteItem, getItem } from "./actions";

export default async function TestSupabaseAuth() {
  const data = await getItem();

  async function handleCreate(formData: any) {
    "use server";

    const title = formData.get("title");
    const description = formData.get("description");
    const content = formData.get("content");
    await createItem(title, description, content);
    revalidatePath("/supabaseAuth");
  }

  async function handleDelete(formData: any) {
    "use server";

    const id = formData.get("id");
    await deleteItem(id);
    revalidatePath("/supabaseAuth");
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="my-[20px]">Supabase Auth</h1>
      {data?.map(item => (
        <form
          className="w-full flex flex-col max-w-[1280px]"
          action={handleDelete}
          key={item.id}
        >
          <div className="grid grid-cols-4 justify-items-start">
            <p>{item.title}</p>
            <p>{item.description}</p>
            <p>{item.content}</p>
            <input type="hidden" name="id" value={item.id} />
            <button type="submit" key={item.id}>
              Delete
            </button>
          </div>
        </form>
      ))}
      <form
        className="w-full flex flex-col max-w-[1280px]"
        action={handleCreate}
      >
        <div className="grid grid-cols-4 justify-items-start">
          <input type="text" name="title" placeholder="title" />
          <input type="text" name="description" placeholder="description" />
          <input type="text" name="content" placeholder="content" />
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  );
}
