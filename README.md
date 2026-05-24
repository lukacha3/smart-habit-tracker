# Smart Habit Tracker 🧠

Sistema de Rastreo de Hábitos con Procesamiento de Lenguaje Natural (PWA Serverless).
El usuario ingresa sus hábitos en lenguaje natural (ej: "Hoy corrí 5km y leí 20 páginas") y la IA estructura los datos automáticamente.

Este proyecto es con el unico fin de aprender APIs de IA, Gestion de Bases de Datos con Supabase y FrontEnd.

## Stack Tecnológico
* **Frontend/Backend:** Next.js (App Router)
* **Base de Datos:** Supabase (PostgreSQL)
* **Inteligencia Artificial:** OpenAI API (gpt-4o-mini)
* **Estilos:** Tailwind CSS

## Cómo levantar el proyecto
1. Instalar dependencias: `npm install`
2. Correr servidor local: `npm run dev`
3. Abrir [http://localhost:3000](http://localhost:3000)


```mermaid
sequenceDiagram
    actor Usuario
    participant UI as Frontend (Next.js)
    participant API as Backend (/api/parse-habit)
    participant OpenAI as IA (gpt-4o-mini)
    participant BD as Supabase (Postgres)

    Usuario->>UI: Ingresa: "Hoy corrí 5km"
    UI->>API: POST HTTP con el texto
    API->>OpenAI: Envía texto + System Prompt
    OpenAI-->>API: Retorna JSON estructurado
    API->>BD: INSERT INTO habits
    BD-->>API: Confirmación (Status 201)
    API-->>UI: Respuesta Exitosa
    UI-->>Usuario: Limpia input y actualiza gráfico
```

```mermaid
erDiagram
    HABITS {
        uuid id PK "Primary Key"
        uuid user_id FK "Clave foránea de Auth"
        text raw_text "Texto original"
        text category "Categoría parseada"
        real quantity "Valor numérico"
        text unit "Unidad de medida"
        timestamptz date "Fecha exacta"
    }
```