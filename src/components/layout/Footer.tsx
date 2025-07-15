
export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-6 mt-auto">
      <div className="container mx-auto px-4 md:px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Galápagos DataLens. Todos los derechos reservados.</p>
        <p className="mt-1">Explorando las maravillas de las Islas Galápagos a través de los datos.</p>
      </div>
    </footer>
  );
}
