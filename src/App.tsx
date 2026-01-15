import Layout from "./app/Layout";
import { MessageList } from "./components/MessageList";

const messages = [
  { id: "1", role: "assistant", content: "### Hello\nThis is **markdown** with a table:\n\n| A | B |\n|---|---|\n| 1 | 2 |" },
  { id: "2", role: "user", content: "Here is some `code`:\n```js\nconsole.log('hi')\n```" }
] as const;

export default function App() {
  return (
    <Layout>
      <MessageList messages={messages} />
    </Layout>
  );
}
