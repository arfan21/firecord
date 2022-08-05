import { Icon } from "@iconify/react";
import { Button } from "@mantine/core";
import { useState } from "react";

export default function Navbar() {
  const [opened, setOpened] = useState(false);
  return (
    <head className="flex">
      <h3>Realtime Chat</h3>
      <Button
        variant="subtle"
        compact
        className="hover:bg-gray-800"
        leftIcon={<Icon icon="akar-icons:google-fill" />}
      >
        Sign in with Google
      </Button>
      <Button>Settings</Button>
    </head>
  );
}
