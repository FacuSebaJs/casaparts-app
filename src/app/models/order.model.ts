export interface OrderItem {
    CONTADO: number,
    COSTO: number,
    TARJETA: number,
    VENTA: number,
    articulo: {
        ART: number,
        AUTO: string,
        CODIGO: string,
        COSTO: string,
        DESCRIP: string,
        DESCRIP2: string,
        DESCRIP3: string,
        DTO: any, MARCA: string,
        N: number, ORIGINAL: string,
        PRECIO: string,
        QLISTA: string,
        QSTOCK: string,
        RUBRO: string,
        RUBRODTO: null
    },
    cantidad: number,
    fecha_creacion: Date,
    fecha_recibido: Date | null,
    id: number,
    id_articulo: string,
    id_pedido: number
}