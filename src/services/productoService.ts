import api from "../api/axios";
import type { Producto } from "../types/producto";
import type { ProductoCategoria } from "../types/productoCategoria";

export const listarProductosActivos = () =>
  api.get<Producto[]>("/productos/activos");

export const crearProducto = (data: Omit<Producto, "idProducto">) =>
  api.post<Producto>("/productos", data);

export const actualizarProducto = (
  id: number,
  data: Omit<Producto, "idProducto">,
) => api.put<Producto>(`/productos/${id}`, data);

export const anularProducto = (id: number) =>
  api.put<Producto>(`/productos/${id}/anular`);

export const filtrarProductosPorNombre = (nombre: string) =>
  api.get<Producto[]>("/productos/activosFiltro", { params: { nombre } });

export const listarProductosConCategoria = () =>
  api.get<ProductoCategoria[]>("/productos/productoCategoria");
