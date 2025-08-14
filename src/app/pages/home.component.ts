import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from './cart/cart.service';
import { ApiService, ProductoApi } from '../services/api.service';


interface Producto {
  id: string | number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  marca?: string;
  rubro?: string;
  modelo?: string;
}

interface Oferta {
  imagen: string;
  nombre: string;
  precio: number;
}

interface RubroApi {
  TITULO: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  // Carrusel y filtros
  ofertas: Oferta[] = [];
  rubrosDesdeApi: RubroApi[] = [];
  marcas: {NOMBRE: string, MARCA: string}[] = [];

  // Estados de carga/error
  cargandoProductos = false;
  errorProductos = '';
  cargandoMarcas = false;
  rubros: {LI:string,TITULO:string}[]=[];
  modelos: {CODIGO: string, NOMBRE: string}[]=[];
  articulos: any;
novedad2: any;


  get cartLength(): number {
    return this.cartService.getCart()?.length ?? 0;
  }

  // Dataset base (se setea desde API o mock)
  private productos = signal<Producto[]>([]);

  filtro = {
    texto: '',
    marca: '',
    rubro: '',
    modelo: '',
  };

  productosFiltrados = computed<Producto[]>(() => {
    const base = this.productos();
    const t = this.filtro.texto?.toLowerCase() || '';
    const m = this.filtro.marca || '';
    const r = this.filtro.rubro || '';
    const mo = this.filtro.modelo || '';

    return base.filter(p => {
      const passTexto =
        !t ||
        p.nombre.toLowerCase().includes(t) ||
        p.descripcion?.toLowerCase().includes(t);
      const passMarca = !m || p.marca === m;
      const passRubro = !r || p.rubro === r;
      const passModelo = !mo || p.modelo === mo;
      return passTexto && passMarca && passRubro && passModelo;
    });
  });

  constructor(
    private router: Router,
    public cartService: CartService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.cargarMarcas();
    this.cargarRubros();
    this.cargarModelos();
    this.cargarnovedades();
   



    // Mock rubros y ofertas para la demo
    this.rubrosDesdeApi = [
      { TITULO: 'Suspensión' },
      { TITULO: 'Frenos' },
      { TITULO: 'Motor' },
    ];

    this.ofertas = [
      { imagen: 'assets/images/oferta1.png', nombre: 'Pastillas de Freno', precio: 24999 },
      { imagen: 'assets/images/oferta2.png', nombre: 'Bieleta', precio: 18999 },
    ];

    // Dataset inicial mock
    this.productos.set([
      { id: 1, nombre: 'Resorte espiral', descripcion: 'Para Sandero', precio: 35000, imagen: 'assets/images/resorte.png', marca: 'Renault', rubro: 'Suspensión', modelo: 'Sandero' },
      { id: 2, nombre: 'Pastillas de freno', descripcion: 'Delanteras',  precio: 27000, imagen: 'assets/images/pastillas.png', marca: 'Volkswagen', rubro: 'Frenos', modelo: 'Gol' },
    ]);
  }

  cargarMarcas(): void {
    this.cargandoMarcas = true;
    this.api.getMarcas().subscribe({
      next: lista => {
        console.log(lista);
        this.marcas = lista;
        this.cargandoMarcas = false;
      },
      error: err => {
        console.error('Error cargando marcas', err);
        this.cargandoMarcas = false;
      }
    });
  }

  cargarRubros(): void {
    // this.cargandoRubros = true;
    this.api.getRubros().subscribe({
      next: lista => {
        console.log(lista);
        this.rubros = lista;
       /*  this.cargandoMarcas = false; */
      },
      error: err => {
        console.error('Error cargando rubros', err);
        /* this.cargando = false; */
      }
    });
  }

  cargarnovedades(): void {
    // this.cargandoRubros = true;
    let cliente=localStorage.getItem('loginClientNumber')
    this.api.getNov(cliente).subscribe({
      next: articulos => {
        console.log(articulos);
        this.articulos = articulos;
      
       /*  this.cargandoMarcas = false; */
      },
      error: err => {
        console.error('Error cargando novedaades', err);
        /* this.cargando = false; */
      }
    });
  }
  cargarModelos(): void {
    // this.cargandoModelos = true;
    this.api.getModelos().subscribe({
      next: lista => {
        console.log(lista);
        this.modelos = lista;
        // this.cargarModelos = false;
      },
      error: err => {
        console.error('Error cargando modelos', err);
        // this.cargandoModelos = false;
      }
    });
  }

  onMarcaChange(): void {
    if (!this.filtro.marca) {
      // Volver a productos iniciales si se elige "Todas las marcas"
      this.productos.set([
        { id: 1, nombre: 'Resorte espiral', descripcion: 'Para Sandero', precio: 35000, imagen: 'assets/images/resorte.png', marca: 'Renault', rubro: 'Suspensión', modelo: 'Sandero' },
        { id: 2, nombre: 'Pastillas de freno', descripcion: 'Delanteras', precio: 27000, imagen: 'assets/images/pastillas.png', marca: 'Volkswagen', rubro: 'Frenos', modelo: 'Gol' },
      ]);
      return;
    }

    this.cargandoProductos = true;
    this.api.getProductosPorMarca(this.filtro.marca).subscribe({
      next: (listaApi: ProductoApi[]) => {
        const mapeados: Producto[] = (listaApi || []).map((x, idx) => ({
          id: x.ID ?? `${this.filtro.marca}-${idx}`,
          nombre: x.NOMBRE ?? 'Producto',
          descripcion: x.DESCRIPCION ?? '',
          precio: Number(x.PRECIO ?? 0),
          imagen: x.IMAGEN || 'assets/images/placeholder.png',
          marca: x.MARCA ?? this.filtro.marca,
          rubro: x.RUBRO ?? '',
          modelo: x.MODELO ?? ''
        }));
        this.productos.set(mapeados);
        this.cargandoProductos = false;
      },
      error: err => {
        console.error(err);
        this.errorProductos = 'No se pudieron cargar productos para la marca seleccionada.';
        this.cargandoProductos = false;
      }
    });
  }

  aplicarFiltro(): void {}

  limpiarFiltros(): void {
    this.filtro = { texto: '', marca: '', rubro: '', modelo: '' };
  }

  agregarAlCarrito(p: Producto): void {
    this.cartService.add(p);
  }

  irAlCarrito(): void {
    this.router.navigate(['/cart']);
  }

  trackByIndex = (i: number) => i;
  trackByProducto = (_: number, p?: Producto) => p?.id ?? _;
}
