"use client";
import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { CirclePlay, StopCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import Console from "@/lib/components/console";
import CommandInput from "@/lib/components/command";

export default function ServerPage() {
  const supabase = createClient();
  const [isAuthorized, setAuthorized] = useState<boolean>(true);

  // useEffect(() => {
  //   supabase.auth.getUser().then(({ data, error }) => {
  //     if (error || !data?.user) {
  //       redirect("/login");
  //     } else {
  //       setAuthorized(true);
  //     }
  // });
  // });

  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("output_log")
      .select()
      .then(({ data, error }) => {
        if (data && !error) setLogs(data.map((obj) => obj.output));
      });

    supabase
      .from("server_status")
      .select()
      .eq("id", 0)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setIsRunning(data[0].starting && data[0].has_finished_starting);
          setIsLoading(data[0].starting && !data[0].has_finished_starting);
        }
      });
  }, []);

  // Toggle server state
  const toggleServer = async () => {
    await supabase
      .from("server_status")
      .update({ starting: !isRunning })
      .eq("id", 0);
  };

  // Add a new log entry
  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  // Handle command submission
  const handleSubmit = async (command: string) => {
    if (!command.trim() || !isRunning) return;

    // Add the command to logs

    let cmd_parse = command.split(" ");
    let cmd_name = cmd_parse[0];
    let cmd_args = cmd_parse.slice(1);

    supabase
      .from("commands")
      .insert({ type: cmd_name, arguments: cmd_args })
      .then(({ error }) => {
        if (!error) addLog(`> ${command}`);
      });
  };

  const channelA = supabase.channel("minecraft_output_log");
  const channelB = supabase.channel("minecraft_server_stat");

  channelA
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "output_log",
      },
      (payload) => {
        addLog(payload.new.output);
      },
    )
    .subscribe();

  channelB
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "server_status",
      },
      (payload) => {
        setIsRunning(payload.new.starting && payload.new.has_finished_starting);
        setIsLoading(
          payload.new.starting && !payload.new.has_finished_starting,
        );
      },
    )
    .subscribe();

  return (
    isAuthorized && (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Minecraft Server Console</h1>
            <Button
              className="gap-2"
              color={isRunning ? "danger" : "success"}
              isLoading={isLoading}
              variant="solid"
              onPress={toggleServer}
            >
              {isRunning ? (
                <>
                  <StopCircle className="h-4 w-4" />
                  Stop Server
                </>
              ) : (
                <>
                  {!isLoading && <CirclePlay className="h-4 w-4" />}
                  Start Server
                </>
              )}
            </Button>
          </div>

          {/* Console logs */}
          <div className="border rounded-md bg-black text-green-400 font-mono text-sm p-4 h-[400px] overflow-y-auto">
            <Console logs={logs} />
          </div>

          {/* Command input */}
          <CommandInput handleSubmit={handleSubmit} isRunning={isRunning} />

          <div className="text-sm text-muted-foreground">
            {isRunning ? (
              <p>
                Server is running. Type &quot;help&quot; for available commands.
              </p>
            ) : (
              <p>Server is stopped. Click the Start Server button to begin.</p>
            )}
          </div>
        </div>
      </div>
    )
  );
}
