"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { SendHorizontal } from "lucide-react";
import { useState } from "react";

export default function CommandInput({
  handleSubmit,
  isRunning,
}: {
  handleSubmit: (command: string) => void;
  isRunning: boolean;
}) {
  const [command, setCommand] = useState<string>("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(command);
        setCommand("");
      }}
    >
      <Input
        className="font-mono bg-gray-800 text-white border-gray-700"
        disabled={!isRunning}
        placeholder={
          isRunning
            ? "Type a command..."
            : "Start the server to enable commands"
        }
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />
      <Button isDisabled={!isRunning} type="submit" variant="ghost">
        <SendHorizontal className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
