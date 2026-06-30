import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { navLinks } from "@/lib/links";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-semibold">
          Sketchify
        </Link>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-muted-foreground">
              {user.username}
            </span>
            <LogoutButton />
          </>
        ) : (
          <>
            <Button asChild variant="ghost">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}