import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function SignIn() {
  const session = useSession();
  const router = useRouter();

  if (session.data && !session.status === "loading") {
    router.push("/");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    await signIn("credentials", { email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}
