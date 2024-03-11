import { SignUp } from "@clerk/nextjs";
import { clerkTheme } from "../clerkTheme";

export default function SignupPage() {
  return (
    <div className="h-full flex justify-center items-center bg-slate-900">
      <SignUp appearance={clerkTheme} />
    </div>
  );
}
