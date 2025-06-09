
export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 md:px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Galapagos DataLens. All rights reserved.</p>
        <p className="mt-1">Exploring the wonders of the Galapagos Islands through data.</p>
      </div>
    </footer>
  );
}
