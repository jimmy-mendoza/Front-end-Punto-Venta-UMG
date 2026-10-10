import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  FileText,
  Filter,
  Package,
  Folder,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { listarProductosActivos } from "../services/productoService";
import { listarCategoriasActivas } from "../services/categoriaService";
import type { Producto } from "../types/producto";
import type { Categoria } from "../types/categoria";
import {
  crearMapaCategorias,
  descargarPDF,
  pdfCategorias,
  pdfProductos,
  pdfProductosYCategorias,
} from "@/lib/reportesPdf";

// Importaciones de shadcn/ui
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const filtroInicial = {
  nombre: "",
  precioMin: "",
  precioMax: "",
  soloConStock: false,
};

function Reportes() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  const [idCategoriaFiltro, setIdCategoriaFiltro] = useState("");
  const [filtro, setFiltro] = useState(filtroInicial);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resProductos, resCategorias] = await Promise.all([
          listarProductosActivos(),
          listarCategoriasActivas(),
        ]);
        setProductos(resProductos.data);
        setCategorias(resCategorias.data);
      } catch (error) {
        console.error("Error al cargar datos de reportes", error);
        setEsError(true);
        setMensaje("No se pudieron cargar los datos para los reportes");
      }
    };
    cargarDatos();
  }, []);

  const mapa = useMemo(() => crearMapaCategorias(categorias), [categorias]);

  // Productos de la categoría elegida
  const productosDeCategoria = useMemo(
    () =>
      idCategoriaFiltro === ""
        ? []
        : productos.filter((p) => p.idCategoria === Number(idCategoriaFiltro)),
    [productos, idCategoriaFiltro],
  );

  // Productos que cumplen el filtro (nombre, precio, stock)
  const productosFiltrados = useMemo(() => {
    const min = filtro.precioMin === "" ? -Infinity : Number(filtro.precioMin);
    const max = filtro.precioMax === "" ? Infinity : Number(filtro.precioMax);
    return productos.filter((p) => {
      const precio = Number(p.precio);
      return (
        p.nombre.toLowerCase().includes(filtro.nombre.toLowerCase()) &&
        precio >= min &&
        precio <= max &&
        (!filtro.soloConStock || p.stock > 0)
      );
    });
  }, [productos, filtro]);

  const avisar = (texto: string, error = false) => {
    setMensaje(texto);
    setEsError(error);
  };

  const handleFiltroChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFiltro((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Acciones de los botones ---

  const reporteProductos = () => {
    if (productos.length === 0)
      return avisar("No hay productos para el reporte", true);
    descargarPDF(pdfProductos(productos, mapa), "reporte_productos.pdf");
    avisar("Reporte de productos generado");
  };

  const reporteCategorias = () => {
    if (categorias.length === 0)
      return avisar("No hay categorías para el reporte", true);
    descargarPDF(pdfCategorias(categorias), "reporte_categorias.pdf");
    avisar("Reporte de categorías generado");
  };

  const reporteGeneral = () => {
    if (productos.length === 0 && categorias.length === 0)
      return avisar("No hay datos para el reporte", true);
    descargarPDF(
      pdfProductosYCategorias(productos, categorias, mapa),
      "reporte_productos_categorias.pdf",
    );
    avisar("Reporte de productos y categorías generado");
  };

  const reportePorCategoria = () => {
    if (idCategoriaFiltro === "")
      return avisar("Selecciona una categoría", true);
    if (productosDeCategoria.length === 0)
      return avisar("Esa categoría no tiene productos", true);
    const nombre = mapa.get(Number(idCategoriaFiltro)) ?? idCategoriaFiltro;
    descargarPDF(
      pdfProductos(
        productosDeCategoria,
        mapa,
        `Productos de la categoría: ${nombre}`,
      ),
      `productos_categoria_${idCategoriaFiltro}.pdf`,
    );
    avisar("Reporte por categoría generado");
  };

  const reporteFiltrado = () => {
    if (productosFiltrados.length === 0)
      return avisar("Ningún producto cumple con el filtro", true);
    descargarPDF(
      pdfProductos(productosFiltrados, mapa, "Productos filtrados"),
      "productos_filtrados.pdf",
    );
    avisar("Reporte filtrado generado");
  };

  const claseBoton =
    "bg-slate-800 transition text-white font-medium py-1.5 px-3 rounded text-sm cursor-pointer";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Encabezado Principal */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground animate-blurred-fade-in animate-duration-slow">
          Reportes
        </h1>
        <p className="text-sm text-muted-foreground mt-1 animate-blurred-fade-in animate-duration-slow">
          Genera reportes en PDF de tus productos y categorías.
        </p>
      </div>

      {/* Banner de Notificación */}
      {mensaje && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg text-sm font-medium border ${
            esError
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
          }`}
        >
          {esError ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{mensaje}</span>
        </div>
      )}

      {/* Reportes generales */}
      <Card className="animate-slide-in-left">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Reportes generales
          </CardTitle>
          <CardDescription>
            {productos.length} productos y {categorias.length} categorías
            disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <button
            onClick={reporteProductos}
            className={`${claseBoton} hover:bg-sky-700`}
          >
            Reporte Producto PDF
          </button>
          <button
            onClick={reporteCategorias}
            className={`${claseBoton} hover:bg-emerald-700`}
          >
            Reporte Categoría PDF
          </button>
          <button
            onClick={reporteGeneral}
            className={`${claseBoton} hover:bg-indigo-700`}
          >
            Productos y Categorías a PDF
          </button>
        </CardContent>
      </Card>

      {/* Filtro por categoría */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Folder className="w-5 h-5 text-muted-foreground" />
            Filtro por categoría
          </CardTitle>
          <CardDescription>
            Elige una categoría y genera el PDF solo con sus productos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="categoriaFiltro">Categoría</Label>
            <select
              id="categoriaFiltro"
              value={idCategoriaFiltro}
              onChange={(e) => setIdCategoriaFiltro(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((c) => (
                <option key={c.idCategoria} value={c.idCategoria ?? ""}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={reportePorCategoria}
              className={`${claseBoton} hover:bg-sky-700`}
            >
              Reporte por categoría PDF
            </button>
            {idCategoriaFiltro !== "" && (
              <span className="text-sm text-muted-foreground">
                {productosDeCategoria.length} producto(s) en esta categoría
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtro de productos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            Filtro de productos
          </CardTitle>
          <CardDescription>
            Filtra por nombre, rango de precio o stock y genera el PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre contiene</Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Ej. Teclado"
                value={filtro.nombre}
                onChange={handleFiltroChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioMin">Precio mínimo (Q)</Label>
              <Input
                type="number"
                step="0.01"
                id="precioMin"
                name="precioMin"
                placeholder="0.00"
                value={filtro.precioMin}
                onChange={handleFiltroChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precioMax">Precio máximo (Q)</Label>
              <Input
                type="number"
                step="0.01"
                id="precioMax"
                name="precioMax"
                placeholder="0.00"
                value={filtro.precioMax}
                onChange={handleFiltroChange}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              name="soloConStock"
              checked={filtro.soloConStock}
              onChange={handleFiltroChange}
            />
            Solo productos con stock
          </label>

          <div className="flex items-center gap-3">
            <button
              onClick={reporteFiltrado}
              className={`${claseBoton} hover:bg-indigo-700`}
            >
              Reporte filtrado PDF
            </button>
            <button
              onClick={() => setFiltro(filtroInicial)}
              className="py-1.5 px-3 rounded text-sm border cursor-pointer hover:bg-slate-100 transition"
            >
              Limpiar filtros
            </button>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Package className="w-4 h-4" />
              {productosFiltrados.length} producto(s) coinciden
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Reportes;
