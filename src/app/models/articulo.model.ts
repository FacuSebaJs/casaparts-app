export interface ArticleItem extends Article {
    ART: number,    
    datosTec?: any
    historial: any[],
    ubicacion: {
        CodigoEquiv: string,
        articulos: Article[]
    }[],
    estado?: string
    fecha_recibido?: any
}

interface Article {    
    AUTO: string,
    CODIGO: string,
    COSTO: string,
    DESCRIP: string,
    DESCRIP2: string | null,
    DESCRIP3: string | null,
    DTO: any
    ENVASE: number,
    LISTA: string,
    MARCA: string,
    N: number,
    ORIGINAL: string,
    PRECIO: string,
    QLISTA: string,
    QSTOCK: string,
    RUBRO: string,
    RUBRODTO: any    
}