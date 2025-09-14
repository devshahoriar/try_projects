import { getCurrentUser } from "@/lib/serverfetch";
import { redirect } from "next/navigation";
import Chat from "./client";

const ChatPage = async () => {
  const user = await getCurrentUser();
  if (!user?.id) {
    return redirect("/login");
  }
  return <Chat />;
};

export default ChatPage;
