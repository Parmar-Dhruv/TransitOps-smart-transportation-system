import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-xl font-semibold">Page Not Found</p>
      <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm">
        Go Back Home
      </Link>
    </div>
  );
}
