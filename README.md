This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


    app/
    ├── (auth)/                          # 🔒 Rutas de autenticación
    │   ├── login/
    │   │   └── page.tsx                 # Página de inicio de sesión             
    ├── (private)/                      # 🔐 Área interna / protegida
    │
    ├── dashboard/
    │   └── page.tsx    
    ├── actas/
    │   ├── consulta/
    │   │   └── page.tsx
    │   ├── cerificacion/
    │   │   └── page.tsx            # Panel principal (ejemplo)
    │
    ├── campeonatos/
    │   ├── categorias/
    │   │   └── page.tsx
    │   ├── grupos/
    │   │   └── page.tsx
    │   └── torneos/
    │       └── page.tsx
    │
    ├── gestion/
    │   ├── arbitros/
    │   │   └── page.tsx
    │   ├── canchas/
    │   │   └── page.tsx
    │   └── equipos/
    │       └── page.tsx
    │
    ├── usuarios/
    │   ├── vocales/
    │   │   └── page.tsx
    │   └── delegados/
    │       └── page.tsx
    │
    └── layout.tsx                  # Layout común para el área privada



    ├── (publico)/                       # 🌍 Área pública
    │   ├── home/
    │   │   └── page.tsx                 # Página de inicio
    │   ├── about/
    │   │   └── page.tsx                 # Página "Acerca de"
    │   └── layout.tsx                   # Layout común para páginas públicas

    ├── api/                             # ⚙️ Endpoints tipo REST
    │   ├── login/
    │   │   └── route.ts                 # Ejemplo: POST /api/auth
    ├── components/                      # 🧩 Componentes reutilizables
    │   ├── layout/
    │   │   ├── Header.tsx               # Encabezado principal
    │   │   ├── Footer.tsx               # Pie de página
    │   │   └── Layout.tsx               # Layout general
    │   ├── ui/
    │   │   └── Button.tsx               # Ejemplo de componente UI
    │   └── forms/
    │       └── LoginForm.tsx            # Formulario de login

    ├── globals.css                      # 🎨 Estilos globales
    ├── layout.tsx                       # Layout raíz del proyecto
    └── page.tsx                         # Redirección o landing principal

    #004C97  (Azul institucional)
    #00923F  (Verde institucional)
    #3FA9F5  (Azul celeste)
    #57B947  (Verde claro)
    #F9C900  (Amarillo dorado)
    #FFFFFF  (Blanco)
    #1A1A1A  (Negro)
        