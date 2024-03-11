import { SignIn } from "@clerk/nextjs";
import { clerkTheme } from "../clerkTheme";

export default function LoginPage() {
  return (
    <div className="h-full flex justify-center items-center bg-slate-900">
      <SignIn appearance={clerkTheme} />
    </div>
  );
}
