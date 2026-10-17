import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Producto } from "../types/producto";
import type { Categoria } from "../types/categoria";
import type { ProductoCategoria } from "../types/productoCategoria";
import type { PedidoCliente } from "../types/pedidoCliente";
import type { PedidoClienteDetalle } from "../types/pedidoClienteDetalle";

export type MapaCategorias = Map<number, string>;

// idCategoria -> nombre, para mostrar el nombre en vez de "Cat. 1"
export const crearMapaCategorias = (categorias: Categoria[]): MapaCategorias =>
  new Map<number, string>(
    categorias
      .filter((c) => c.idCategoria !== null)
      .map((c): [number, string] => [c.idCategoria as number, c.nombre]),
  );

const nombreCategoria = (idCategoria: number | null, mapa: MapaCategorias) =>
  idCategoria === null
    ? "Sin categoría"
    : (mapa.get(idCategoria) ?? `Cat. ${idCategoria}`);

// Dibuja la tabla de productos y devuelve la posición Y donde terminó
const tablaProductos = (
  doc: jsPDF,
  productos: Producto[],
  mapa: MapaCategorias,
  startY: number,
): number => {
  let finalY = startY;
  autoTable(doc, {
    head: [
      ["ID", "Producto", "Descripción", "Categoría", "Precio (Q)", "Stock"],
    ],
    body: productos.map((p) => [
      p.idProducto ?? "-",
      p.nombre,
      p.descripcion || "—",
      nombreCategoria(p.idCategoria, mapa),
      `Q${Number(p.precio).toFixed(2)}`,
      `${p.stock} un.`,
    ]),
    startY,
    didDrawPage: (data) => {
      finalY = data.cursor?.y ?? finalY;
    },
  });
  return finalY;
};

// Dibuja la tabla de categorías y devuelve la posición Y donde terminó
const tablaCategorias = (
  doc: jsPDF,
  categorias: Categoria[],
  startY: number,
): number => {
  let finalY = startY;
  autoTable(doc, {
    head: [["ID", "Nombre", "Descripción"]],
    body: categorias.map((c) => [
      c.idCategoria ?? "-",
      c.nombre,
      c.descripcion || "—",
    ]),
    startY,
    didDrawPage: (data) => {
      finalY = data.cursor?.y ?? finalY;
    },
  });
  return finalY;
};

export const pdfProductos = (
  productos: Producto[],
  mapa: MapaCategorias,
  titulo = "Listado de Productos",
) => {
  const doc = new jsPDF();
  doc.text(titulo, 14, 15);
  tablaProductos(doc, productos, mapa, 20);
  return doc;
};

export const pdfCategorias = (categorias: Categoria[]) => {
  const doc = new jsPDF();
  doc.text("Listado de Categorías", 14, 15);
  tablaCategorias(doc, categorias, 20);
  return doc;
};

export const pdfProductosYCategorias = (
  productos: Producto[],
  categorias: Categoria[],
  mapa: MapaCategorias,
) => {
  const doc = new jsPDF();
  doc.text("Reporte General: Categorías y Productos", 14, 15);

  doc.setFontSize(12);
  doc.text("Categorías", 14, 25);
  const finalY = tablaCategorias(doc, categorias, 28);

  doc.text("Productos", 14, finalY + 12);
  tablaProductos(doc, productos, mapa, finalY + 15);
  return doc;
};

export const descargarPDF = (doc: jsPDF, nombreArchivo: string) =>
  doc.save(nombreArchivo);

export const pdfProductosConCategoria = (datos: ProductoCategoria[]) => {
  const doc = new jsPDF();
  doc.text("Reporte de Productos con su Categoría", 14, 15);
  autoTable(doc, {
    head: [["ID", "Producto", "Categoría"]],
    body: datos.map((d) => [
      d.idProducto,
      d.nombreProducto,
      d.categoriaProducto,
    ]),
    startY: 20,
  });
  return doc;
};

const formatearFecha = (valor: string | number) =>
  new Date(valor).toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const pdfPedidosCliente = (datos: PedidoCliente[]) => {
  const doc = new jsPDF();
  doc.text("Reporte de Pedidos por Cliente", 14, 15);
  autoTable(doc, {
    head: [["Fecha Pedido", "Nombre Cliente"]],
    body: datos.map((d) => [formatearFecha(d.fechaPedido), d.nombreCliente]),
    startY: 20,
  });
  return doc;
};

export const pdfPedidosClienteDetalle = (datos: PedidoClienteDetalle[]) => {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.text("Reporte de Pedidos por Cliente (Detalle)", 14, 15);
  autoTable(doc, {
    head: [
      [
        "Fecha Pedido",
        "Cliente",
        "Producto",
        "Cantidad",
        "Precio (Q)",
        "Precio Unitario (Q)",
        "SubTotal (Q)",
      ],
    ],
    body: datos.map((d) => [
      formatearFecha(d.fechaPedido),
      d.nombreCliente,
      d.nombreProducto,
      d.cantidad,
      Number(d.precio).toFixed(2),
      Number(d.precioUnitario).toFixed(2),
      Number(d.subtotal).toFixed(2),
    ]),
    startY: 20,
  });
  return doc;
};
