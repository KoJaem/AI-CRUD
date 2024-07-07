import { createItem, deleteItem, getItem } from "./actions";

export default async function TestSupabaseAuth() {
  const data = await getItem();

  async function handleCreate(formData: any) {
    "use server";

    const title = formData.get("title");
    const description = formData.get("description");
    const content = formData.get("content");
    console.log(title, description, content)
    await createItem(title, description, content);
  }

  async function handleDelete(formData: any) {
    "use server";

    const id = formData.get("id");
    await deleteItem(id);
  }

  return (
    <div className="flex flex-col gap-[20px] items-center justify-center">
      <h1>Supabase Auth</h1>
      {data?.map(data => (
        <div key={data.id} className="flex flex-col gap-[12px]">
          <p>{data.title}</p>
          <form action={handleCreate}>
            <input type="text" name="title" placeholder="title" />
            <input type="text" name="description" placeholder="description" />
            <input type="text" name="content" placeholder="content" />
            <button type="submit">Create</button>
          </form>
          <form action={handleDelete}>
            <input type="hidden" name="id" value={data.id} />
            <button type="submit">Delete</button>
          </form>
          {/* <button onClick={() => deleteItem(data.id)}>delete</button> */}
        </div>
      ))}
    </div>
  );
}
