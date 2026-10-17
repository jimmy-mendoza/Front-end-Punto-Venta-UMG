export interface PedidoClienteDetalle {
  fechaPedido: string | number;
  nombreCliente: string;
  nombreProducto: string;
  cantidad: number;
  precio: number;
  precioUnitario: number;
  subtotal: number;
}
