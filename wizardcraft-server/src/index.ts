import { createClient, RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import { spawn } from 'child_process';

const URL = "https://inejypcttzvqzyznmxpl.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZWp5cGN0dHp2cXp5em5teHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzU5NjcsImV4cCI6MjA1NzMxMTk2N30.adFdRxhJJCP9gQMBkSYOxVUiVBhnz_UncgRqE3r-pc0";



const supabase = createClient(URL, KEY);

const c_process = spawn('./src/cpp_lib/craft_proxy');
console.log("Process Created!");


c_process.stdout.on("data", (data) => {
  console.log(`C++ Output: ${data.toString()}`);
});

c_process.stderr.on("data", (data) => {
  console.error(`C++ Error: ${data.toString()}`);
});

const messageReceived = (payload: RealtimePostgresUpdatePayload<{ [key: string]: any; }>) => {
  c_process.stdin.write(`Update Detected!: ${JSON.stringify(payload.new)}\n`);
}

const channelA = supabase.channel("minecraft-server-status");

channelA
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "server_log"
    },
    (payload) => messageReceived(payload))
  .subscribe();






