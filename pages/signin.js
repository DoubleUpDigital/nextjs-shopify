import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (session && status !== "loading") {
      router.push("/orders");
    }
  }, [session, status, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Get the form data
    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result.error) {
        setError(result.error);
      } else {
        setError("");
        // Redirect to the desired page after successful login
        router.push("/orders");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred during sign-in.");
    }
  };



  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}
