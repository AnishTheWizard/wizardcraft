import { createClient, RealtimePostgresUpdatePayload } from '@supabase/supabase-js';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

const URL = "https://inejypcttzvqzyznmxpl.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZWp5cGN0dHp2cXp5em5teHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MzU5NjcsImV4cCI6MjA1NzMxMTk2N30.adFdRxhJJCP9gQMBkSYOxVUiVBhnz_UncgRqE3r-pc0";



const supabase = createClient(URL, KEY);

// async function signUpUser() {
//   await supabase.auth.signInWithPassword({
//     email: 'anishcha@umich.edu',
//     password: 'W1z@rd13905070'
//   }).then(({ data }) => console.log(data));
// }

// signUpUser();

var global_c_process: ChildProcessWithoutNullStreams | null = null;


const channelA = supabase.channel("minecraft_server_stat");

const setupServer = () => {
  console.log("starting process");
  if(global_c_process) {
    global_c_process.kill();
    global_c_process = null;
  }
  global_c_process = spawn('./src/cpp_lib/craft_proxy');

  global_c_process.stdout.on("data", async (data) => {
    console.log(data.toString());
    await supabase
      .from("output_log")
      .insert({ output: data.toString() })
      .then(({error}) => console.log(error));
  });

  global_c_process.stderr.on("data", async (data) => {
    console.log(data.toString());
    await supabase
      .from("output_log")
      .insert({ output: data.toString() })
      .then(({error}) => console.log(error));
  });

  global_c_process.stdin.write("hello world!\n");
}

channelA
  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "server_status"
    },
    (payload) => {
      if(payload.new.starting && payload.new.has_finished_starting) setupServer(); // TODO this logic is wrong
      else if(!payload.new.starting) {
        global_c_process?.kill();
        global_c_process = null;
      }
    })
  .subscribe();

const channelB = supabase.channel("minecraft_commands");

channelB
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "commands"
    },
    (payload) => {
      console.log(payload.new.type + " " +payload.new.arguments.join(" "));
      global_c_process.stdin.write(payload.new.type + " " +payload.new.arguments.join(" ") + "\n");
    })
  .subscribe();




