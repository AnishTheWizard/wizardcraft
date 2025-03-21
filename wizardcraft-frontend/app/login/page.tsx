"use server";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import { redirect } from "next/navigation";

import { login } from "./actions";

import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();

  // const { data, error } = await supabase.auth.getUser();

  // if (!error || data?.user) {
  //   redirect("/");
  // }

  const signIn = async (event: any) => {
    event.preventDefault();
    let formData = new FormData(event.currentTarget);

    login(formData);
  };

  const signOut = async (event: any) => {
    console.log("sign out");
    await supabase.auth.signOut().then(async (data) => {
      console.log(data);
      await supabase.auth.getSession().then((data) => console.log(data));
    });
  };

  return (
    <div className="flex">
      {/* Form Section */}
      <div className="flex flex-col w-full">
        <div className="w-full max-w-md space-y-6 py-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Welcome McWonder2</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Enter your credentials to sign in to your account
            </p>
          </div>
          <Form
            className="w-full max-w-xs flex flex-col gap-4"
            onSubmit={signIn}
          >
            <Input
              isRequired
              errorMessage="Please enter a valid email"
              label="Email"
              labelPlacement="outside"
              name="email"
              placeholder="Enter your email"
              type="text"
            />

            <Input
              isRequired
              errorMessage="Please enter a valid password"
              label="Password"
              labelPlacement="outside"
              name="password"
              placeholder="Enter your password"
              type="password"
            />
            <div className="flex gap-2">
              <Button color="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
          <button color="primary" type="button" onClick={signOut}>
            sign out
          </button>
        </div>
      </div>
    </div>
  );
}
