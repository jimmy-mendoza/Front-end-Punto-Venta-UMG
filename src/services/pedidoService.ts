import api from "../api/axios";
import type { PedidoCliente } from "../types/pedidoCliente";
import type { PedidoClienteDetalle } from "../types/pedidoClienteDetalle";

export const listarPedidosConCliente = () =>
  api.get<PedidoCliente[]>("/pedidos/pedidoCliente");

export const listarPedidosClienteDetalle = () =>
  api.get<PedidoClienteDetalle[]>("/pedido-detalles/pedidoClienteDetalle");
