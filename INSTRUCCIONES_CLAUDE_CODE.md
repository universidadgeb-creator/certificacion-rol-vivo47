# Seguimiento de Certificación de Rol — VIVO 47 / GEB University

## Qué es esto
Es una app en React de una sola página (`certificacion_rol_vivo47.jsx`) para dar seguimiento a la certificación de rol de nuevos colaboradores en VIVO 47. Tiene 3 vistas: **Administrador**, **Líder** y **Colaborador**.

Hoy vive como un *artifact* de claude.ai, así que usa `window.storage` (una API especial de guardado que **solo existe dentro de claude.ai**, no en un proyecto normal de React/Vite). Ese es el primer punto que Claude Code necesita resolver si vamos a convertir esto en una app de verdad, fuera del chat.

## Contenido de los 3 roles
- **Administrador**: crea certificaciones nuevas (departamento → rol → colaborador → sucursal → líder), ve resumen general con semáforo, filtra, entra al detalle, elimina.
- **Líder**: se identifica con su nombre, busca al colaborador, marca actividad por actividad de cada proceso, agrega observaciones por proceso.
- **Colaborador**: se identifica con su nombre, ve su avance (solo lectura) y llena su autoevaluación (confianza por proceso + preguntas de reflexión abiertas, cuando el rol las tiene).

## De dónde salen los datos
Los 26 roles de VIVO 47 (procesos + actividades + semanas, y las 4 autoevaluaciones con preguntas abiertas: Cobranza, 0 Accesos, Socios Nuevos, Socios +3 meses) están **embebidos directamente en el archivo** como un objeto JSON grande (`CERT_DATA`), extraído del Excel maestro *"Certificación de Rol Vivo 47 COMPLETO.xlsx"*. No hay backend ni base de datos externa todavía — todo vive en ese único archivo.

## Qué le puedes pedir a Claude Code
Dale este archivo `.jsx` completo como punto de partida y dile qué quieres lograr. Algunas ideas, de más simple a más grande:

1. **Convertirlo en proyecto real** (Vite + React + Tailwind) que corra en tu computadora o se pueda desplegar (Vercel, Netlify, etc.).
2. **Reemplazar `window.storage` por una base de datos real** — lo más natural es Firebase (Firestore) o Supabase, para que los datos persistan de verdad fuera de claude.ai y sean accesibles desde un dominio propio.
3. **Agregar autenticación real** (hoy solo se pide el nombre, sin contraseña) — por ejemplo login por correo de GEB, o un código por sucursal.
4. **Separar los datos de certificación** del código (hoy están embebidos) hacia un archivo JSON aparte o una hoja de cálculo conectada, para que puedas actualizar procesos/actividades sin tocar código.
5. **Agregar reportes/analítica** — comparar avance entre sucursales, exportar a Excel, dashboards de tiempos de certificación, etc.

## Un pendiente que ya sabemos
En el rol "Coordinador de Mantenimiento", el Excel original numeraba los procesos de forma inconsistente (número repetido y saltos). En el código ya está corregido con un identificador interno estable (`idx`) que no depende del número original — si migras los datos a otro formato, conserva esa lógica en vez de volver a los números originales del Excel.

---

**Cómo usarlo:** copia el contenido de `certificacion_rol_vivo47.jsx` y este archivo en la carpeta de tu proyecto (o pégaselos directo a Claude Code en el chat) y dile en qué punto de la lista de arriba quieres empezar.
