import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  async function register(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || password.length < 6) return;

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, passwordHash, role: "USER" },
    });

    redirect("/login");
  }

  return (
    <form action={register} className="p-6 max-w-sm space-y-3">
      <h1 className="text-xl font-semibold">Register</h1>
      <input className="w-full border px-3 py-2" name="email" placeholder="email" />
      <input
        className="w-full border px-3 py-2"
        name="password"
        type="password"
        placeholder="password (min 6)"
      />
      <button className="border px-3 py-2 w-full" type="submit">
        Create account
      </button>
    </form>
  );
}