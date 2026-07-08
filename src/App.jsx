import React, { useState, useEffect, useMemo } from "react";
import {
  Building2, Users, UserCircle2, ArrowLeft, Plus, Search, CheckCircle2,
  Circle, X, ClipboardList, MessageSquareText, BarChart3,
  MapPin, Calendar, Info, Loader2, ChevronRight, Trash2, Save, ListChecks, Download, Clock
} from "lucide-react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import logoGebUniversity from "./assets/logo-geb-university.png";
import logoGeb from "./assets/logo-geb.png";

/* ============================================================
   DATOS: plantillas de certificación de rol — VIVO 47
   Extraído de "Certificación de Rol Vivo 47 COMPLETO.xlsx"
   (26 roles · departamentos · autoevaluación donde existe)
   ============================================================ */
const DEFAULT_CERT_DATA = {"departamentos":{"Administración":["Ejecutivo de Cobranza","Ejecutivo de 0 Accesos","Ejecutivo de socios nuevos","Ejecutivo de socios +3 meses","Caja","Recepción"],"Deportes":["Líder Deportivo","Coach Deportivo","Coach de Estiramiento","Nutrición","Coach de Mobility","Técnico Clases","Técnico Fuerza y Cardio"],"Acuática":["Líder de Acuática","Auxiliar de Acuática","Instructor de Acuática","Técnico Acuática"],"Kids":["Maestra Kids","Aux. Kids"],"Mantenimiento":["Líder de Mantenimiento","Coordinador de Mantenimiento","Técnico de Mantenimiento"],"Orden y Limpieza":["Capitán de Limpieza","Concierge de Vestidores","Técnico Vestidores","Técnico Estacionamiento"]},"roles":{"Ejecutivo de Cobranza":{"departamento":"Administración","procesos":[{"n":1,"proceso":"Apertura de Club- Check list de limpieza","semana":"Semana 1","actividades":["Realizar el checklist revisando la limpieza de las áreas","Prender caminadoras, luces y aires","Abrir la caja en recepción","Prender computadoras"],"idx":0},{"n":2,"proceso":"Cierre de Club - Check list de limpieza","semana":"Semana 1","actividades":["Realizar Check list de todas la áreas en cuanto a limpieza","Revisar salones y estudios.","Apagar aires, luces, equipo de cardio y computadoras"],"idx":1},{"n":3,"proceso":"Check List de limpieza por turno","semana":"Semana 1","actividades":["Pasar por las áreas del club y revisar el contenido del checklist de limpieza.","Evaluar limpieza para calificación del turno.","Sacar promedio del checklist de los dos turnos.","Capturar los datos en la pizarra.","Dar retroalimnetación a Orden y Limpieza y Manetnimiento."],"idx":2},{"n":4,"proceso":"NPS","semana":"Semana 1","actividades":["Extraer los datos del día anterior de la base de datos.","Realizar las preguntas de seguimiento.","Pasar las respuestas a la bitacora.","Compartir al equipo la información relevante para la toma de desiciones.","Dar seguimiento con el área correspondiente.","Compartir el cierre de ciclo.","Llenado de pizarra."],"idx":3},{"n":5,"proceso":"Ausencias","semana":"Semana 1","actividades":["Bajar la base de datos.","Generar la base de ausencias.","Llenar información detallada del caso y entregar al socio para firma para documentar el tramite hecho por el titular.","Registrar en el sistema."],"idx":4},{"n":6,"proceso":"Bajas","semana":"Semana 1","actividades":["Recibir solicitud de baja.","Identifica si es temporal o definitiva.","Derivar con el líder de turno.","Realizar tramite de baja en el sistema.","Registrar en Drive y en pizarra, o en el sistema en caso de ser baja temporal."],"idx":5},{"n":7,"proceso":"Bajas por Cobranza","semana":"Semana 1","actividades":["Bajar base de datos.","Separar los diferentes tipos de membresia.","Separar por antigüedad (1-6 meses, 7-12 meses, más de 12 meses).","Contactar al titular.","Mandar recordatorios de pago.","Empezar el cobro de los socios en cartera.","Derivar a caja para el pago.","Tramitar ausencia en caso de ser necesario."],"idx":6},{"n":8,"proceso":"Cobranza","semana":"Semana 2","actividades":["Recibir al socio","Recibir pagos de:","Membresia","Mensualidad","Otros articulos (Acuática, nutrición, etc.)"],"idx":7},{"n":9,"proceso":"Alta de Membresía","semana":"Semana 2","actividades":["Recibir al socio con la solicitud de Alta","Revisar que este firmada por líder de turno o gerente","Dar de alta en el sistema","Hacer el cobro en caja","Llenar los datos del socio para el cobro."],"idx":8},{"n":10,"proceso":"Cargos Automáticos","semana":"Semana 2","actividades":["Agregar los datos bancarios del socio a su perfil  en el sistema para que se realicen los cobros."],"idx":9},{"n":11,"proceso":"Elaboración del expediente / Físico y Digital","semana":"Semana 2","actividades":["Verificar que los datos estén completos.","Elaborar el expediente fisíco.","Validar el check list de Alta de Calidad","Mandar el expediente a filtro","Archivar el expediente"],"idx":10},{"n":12,"proceso":"Cambios de Titularidad (Casos especiales)","semana":"Semana 2","actividades":["Recibir solicitud.","Abrir un nuevo expediente.","Dar de alta en el sistema.","Registrar Perfil, Foto, Huella y App"],"idx":11},{"n":13,"proceso":"Cambios de Membresía (Casos especiales)","semana":"Semana 2","actividades":["Recibir solicitud","Derivar con R.P. o líder de turno.","Realizar el llenado de información y agregar integrantes en caso de que se cambie a una membresia de pareja o familiar.","Realizar el cambio en el sistema."],"idx":12},{"n":14,"proceso":"Tours","semana":"Semana 3","actividades":["Recibir al prospecto.","Derivar con un R.P.","Registrar en la bitácora de Tours."],"idx":13},{"n":15,"proceso":"Listas para las clases de Pulse","semana":"Semana 3","actividades":["Hacer la lista antes de la clase de Pulse","Checar las clases del día en la App.","Subir aforos al grupo de WhatsApp.","Anotar las listas en la tabla.","Validar la clase cuando entran los socios."],"idx":14},{"n":16,"proceso":"Ordenar micrófono (Salones y estudios)","semana":"Semana 3","actividades":["Mantener las pilas cargadas.","Entregar microfono al instructor.","Limpiar y resguardar."],"idx":15},{"n":17,"proceso":"Registro de accesos al club: pase de visita, tours","semana":"Semana 3","actividades":["Revisar si el visitante está anotado en la bitácora de Drive.","Marcar su asistencia.","Registrar al visitante."],"idx":16},{"n":18,"proceso":"Toma de Foto, Huella y Aplicación","semana":"Semana 3","actividades":["Recibir al socio en recepción después del llenado del Alta","Tomar la foto con la cámara del sistema","Grabar la huella desde el sistema","Apoyar al socio con la descarga de la app.","Explicar el uso de la app y como reservar los diferentes servicios."],"idx":17},{"n":19,"proceso":"Entrega de cheque de devolución","semana":"Semana 3","actividades":["Revisar en la carpeta de cheques","Entregar al socio con la entrega de una identificación","Sacar una copia a la identifiación","Recibir la poliza firmada."],"idx":18},{"n":20,"proceso":"Venta de prepagos (NAC)","semana":"Semana 3","actividades":["Comunicar al socio el precio de prepago","Cobrar en caja","Ingresar en sistema como estacionamiento"],"idx":19},{"n":21,"proceso":"Felicitación de cumpleaños","semana":"Semana 4","actividades":["Descargar la base de cumpleañeros","Realizar las imagenes en Canva con los Cumpleañeros, nombre y foto del socio","Mandar un mensaje individual de cumpleaños"],"idx":20},{"n":22,"proceso":"Objetos olvidados","semana":"Semana 4","actividades":["Reportar los objetos olvidados a Capitán de limpieza, recepción, líderes","Tomar foto y subir al grupo del club","Enviar a bodega asignada a su resguardo","Se entregar los objetos olvidados al socio"],"idx":21},{"n":23,"proceso":"Paquetería","semana":"Semana 4","actividades":["Recibir paquetería en recepción.","Mandar foto al grupo de Whatsapp y comunicar para quien es el paquete."],"idx":22},{"n":24,"proceso":"Validación de clases","semana":"Semana 4","actividades":["Estár en la entrada de la clase antes de empezar y validar la asistencia de los socios por medio de la app."],"idx":23},{"n":25,"proceso":"Firma de asistencia de instructores de salón","semana":"Semana 4","actividades":["Dar a firmar asistencia a los instructores de clases de salón","Validar las asistencias por medio de la app"],"idx":24},{"n":26,"proceso":"5´s","semana":"Semana 4","actividades":["Aplicar las 5´S en las áreas"],"idx":25},{"n":27,"proceso":"Rewards","semana":"Semana 4","actividades":["Dar información al socio sobre rewards o el canjeo de puntos","Revisar las solicitudes","Llevar a recepción lo necesario","Llevar un registro en TG"],"idx":26}],"total_procesos":27,"total_actividades":103,"autoevaluacion":[{"semana":"Semana 1","preguntas":["Si al realizar el checklist de limpieza detectas que el área de cardio no cumple con el estándar de limpieza, ¿cuál es el protocolo a seguir para la retroalimentación con el equipo?\".","¿Por qué es fundamental no solo registrar las respuestas de NPS en la bitácora, sino compartir la información relevante con el equipo y dar seguimiento al área correspondiente?","En un caso donde el socio solicita una ausencia, ¿qué elementos debe contener el llenado detallado para que el trámite quede correctamente documentado en el sistema y para la firma del titular?"]},{"semana":"Semana 2","preguntas":["Durante la elaboración de un expediente físico y digital, ¿qué puntos específicos revisas para asegurar que los datos estén completos antes de mandarlo a filtro?\".","Describe el flujo de contacto desde que envías el recordatorio de pago hasta que el socio se presenta en el club; si el socio no puede pagar en ese momento, ¿bajo qué condiciones específicas tramitarías una ausencia en lugar de proceder con la baja?","Si tras realizar la gestión de cobro de los socios en cartera el titular accede a liquidar su adeudo, ¿cuál es el procedimiento para derivarlo correctamente a caja  y asegurar que su estatus se actualice en el sistema para evitar una baja errónea?\"."]},{"semana":"Semana 3","preguntas":["Después del alta, al grabar la huella y tomar la foto, ¿cómo le explicarías a un socio nuevo el uso de la App para que sepa reservar sus servicios de manera autónoma?\".","En las clases de Pulse, ¿cuál es la importancia de validar la asistencia vía App al momento de la entrada y cómo reportas el aforo al grupo de WhatsApp?\".","Si un socio acude por su cheque de devolución, ¿qué documentos debes validar y qué debe firmar el socio para completar el resguardo legal de la póliza?\"."]},{"semana":"Semana 4","preguntas":["Cultura de Orden (5'S): \"¿Cómo aplicarías los principios de las 5'S en tu área de trabajo diaria y qué beneficios directos tiene esto en la experiencia del socio?","Si encuentras un objeto de valor en el club, describe el proceso desde la toma de fotografía hasta su envío a la bodega de resguardo y la entrega final al socio.\".","Si un socio te pregunta cómo canjear sus puntos de Rewards, ¿cuáles son los pasos para revisar su solicitud y llevar el registro correcto en el sistema (TG)?"]}]},"Ejecutivo de 0 Accesos":{"departamento":"Administración","procesos":[{"n":1,"proceso":"Apertura de Club- Check list de limpieza","semana":"Semana 1","actividades":["Realizar el checklist revisando la limpieza de las áreas","Prender caminadoras, luces y aires","Abrir la caja en recepción","Prender computadoras"],"idx":0},{"n":2,"proceso":"Cierre de Club - Check list de limpieza","semana":"Semana 1","actividades":["Realizar Check list de todas la áreas en cuanto a limpieza","Revisar salones y estudios.","Apagar aires, luces, equipo de cardio y computadoras"],"idx":1},{"n":3,"proceso":"Check List de limpieza por turno","semana":"Semana 1","actividades":["Pasar por las áreas del club y revisar el contenido del checklist de limpieza.","Evaluar limpieza para calificación del turno.","Sacar promedio del checklist de los dos turnos.","Capturar los datos en la pizarra.","Dar retroalimnetación a Orden y Limpieza y Manetnimiento."],"idx":2},{"n":4,"proceso":"NPS","semana":"Semana 1","actividades":["Extraer los datos del día anterior de la base de datos.","Realizar las preguntas de seguimiento.","Pasar las respuestas a la bitacora.","Compartir al equipo la información relevante para la toma de desiciones.","Dar seguimiento con el área correspondiente.","Compartir el cierre de ciclo.","Llenado de pizarra."],"idx":3},{"n":5,"proceso":"Ausencias","semana":"Semana 1","actividades":["Bajar la base de datos.","Generar la base de ausencias.","Llenar información detallada del caso y entregar al socio para firma para documentar el tramite hecho por el titular.","Registrar en el sistema."],"idx":4},{"n":6,"proceso":"Bajas","semana":"Semana 1","actividades":["Recibir solicitud de baja.","Identifica si es temporal o definitiva.","Derivar con el líder de turno.","Realizar tramite de baja en el sistema.","Registrar en Drive y en pizarra, o en el sistema en caso de ser baja temporal."],"idx":5},{"n":7,"proceso":"Cero Accesos","semana":"Semana 1","actividades":["Bajar la base de datos del mes anterior.","Revisar la base para identificar 0 accesos.","Contactar a los socios en 0 accesos","Mandar información (clases y eventos del mes), invitar al socio a regresar.","Actualizar la pizarra de 0 Accesos semana a semana","Reactivar socios de 0 accesos"],"idx":6},{"n":8,"proceso":"Cobranza en caja","semana":"Semana 2","actividades":["Recibir al socio","Recibir pagos de:","Membresia","Mensualidad","Otros articulos (Acuática, nutrición, etc.)"],"idx":7},{"n":9,"proceso":"Alta de Membresía","semana":"Semana 2","actividades":["Recibir al socio con la solicitud de Alta","Revisar que este firmada por líder de turno o gerente","Dar de alta en el sistema","Hacer el cobro en caja","Llenar los datos del socio para el cobro."],"idx":8},{"n":10,"proceso":"Cargos Automáticos","semana":"Semana 2","actividades":["Agregar los datos bancarios del socio a su perfil  en el sistema para que se realicen los cobros."],"idx":9},{"n":11,"proceso":"Elaboración del expediente / Físico y Digital","semana":"Semana 2","actividades":["Verificar que los datos estén completos.","Elaborar el expediente fisíco.","Validar el check list de Alta de Calidad","Mandar el expediente a filtro","Archivar el expediente"],"idx":10},{"n":12,"proceso":"Cambios de Titularidad (Casos especiales)","semana":"Semana 2","actividades":["Recibir solicitud.","Abrir un nuevo expediente.","Dar de alta en el sistema.","Registrar Perfil, Foto, Huella y App"],"idx":11},{"n":13,"proceso":"Cambios de Membresía (Casos especiales)","semana":"Semana 2","actividades":["Recibir solicitud","Derivar con R.P. o líder de turno.","Realizar el llenado de información y agregar integrantes en caso de que se cambie a una membresia de pareja o familiar.","Realizar el cambio en el sistema."],"idx":12},{"n":14,"proceso":"Tours","semana":"Semana 3","actividades":["Recibir al prospecto.","Derivar con un R.P.","Registrar en la bitácora de Tours."],"idx":13},{"n":15,"proceso":"Listas para las clases de Pulse","semana":"Semana 3","actividades":["Hacer la lista antes de la clase de Pulse","Checar las clases del día en la App.","Subir aforos al grupo de WhatsApp.","Anotar las listas en la tabla.","Validar la clase cuando entran los socios."],"idx":14},{"n":16,"proceso":"Ordenar micrófono (Salones y estudios)","semana":"Semana 3","actividades":["Mantener las pilas cargadas.","Entregar microfono al instructor.","Limpiar y resguardar."],"idx":15},{"n":17,"proceso":"Registro de accesos al club: pase de visita, tours","semana":"Semana 3","actividades":["Revisar si el visitante está anotado en la bitácora de Drive.","Marcar su asistencia.","Registrar al visitante."],"idx":16},{"n":18,"proceso":"Toma de Foto, Huella y Aplicación","semana":"Semana 3","actividades":["Recibir al socio en recepción después del llenado del Alta","Tomar la foto con la cámara del sistema","Grabar la huella desde el sistema","Apoyar al socio con la descarga de la app.","Explicar el uso de la app y como reservar los diferentes servicios."],"idx":17},{"n":19,"proceso":"Entrega de cheque de devolución","semana":"Semana 3","actividades":["Revisar en la carpeta de cheques","Entregar al socio con la entrega de una identificación","Sacar una copia a la identifiación","Recibir la poliza firmada."],"idx":18},{"n":20,"proceso":"Venta de prepagos (NAC)","semana":"Semana 3","actividades":["Comunicar al socio el precio de prepago","Cobrar en caja","Ingresar en sistema como estacionamiento"],"idx":19},{"n":21,"proceso":"Felicitación de cumpleaños","semana":"Semana 4","actividades":["Descargar la base de cumpleañeros","Realizar las imagenes en Canva con los Cumpleañeros, nombre y foto del socio","Mandar un mensaje individual de cumpleaños"],"idx":20},{"n":22,"proceso":"Objetos olvidados","semana":"Semana 4","actividades":["Reportar los objetos olvidados a Capitán de limpieza, recepción, líderes","Tomar foto y subir al grupo del club","Enviar a bodega asignada a su resguardo","Se entregar los objetos olvidados al socio"],"idx":21},{"n":23,"proceso":"Paquetería","semana":"Semana 4","actividades":["Recibir paquetería en recepción.","Mandar foto al grupo de Whatsapp y comunicar para quien es el paquete."],"idx":22},{"n":24,"proceso":"Validación de clases","semana":"Semana 4","actividades":["Estár en la entrada de la clase antes de empezar y validar la asistencia de los socios por medio de la app."],"idx":23},{"n":25,"proceso":"Firma de asistencia de instructores de salón","semana":"Semana 4","actividades":["Dar a firmar asistencia a los instructores de clases de salón","Validar las asistencias por medio de la app"],"idx":24},{"n":26,"proceso":"5´s","semana":"Semana 4","actividades":["Aplicar las 5´S en las áreas"],"idx":25},{"n":27,"proceso":"Rewards","semana":"Semana 4","actividades":["Dar información al socio sobre rewards o el canjeo de puntos","Revisar las solicitudes","Llevar a recepción lo necesario","Llevar un registro en TG"],"idx":26}],"total_procesos":27,"total_actividades":101,"autoevaluacion":[{"semana":"Semana 1","preguntas":["Si al realizar el checklist de limpieza detectas que el área de cardio no cumple con el estándar de limpieza, ¿cuál es el protocolo a seguir para la retroalimentación con el equipo?\".","¿Por qué es fundamental no solo registrar las respuestas de NPS en la bitácora, sino compartir la información relevante con el equipo y dar seguimiento al área correspondiente?","Después de identificar a los socios con 0 accesos en el mes anterior, ¿qué información específica les proporcionas (clases, eventos) para incentivarlos a regresar y cómo actualizas esta progresión en la pizarra semanal?"]},{"semana":"Semana 2","preguntas":["Durante la elaboración de un expediente físico y digital, ¿qué puntos específicos revisas para asegurar que los datos estén completos antes de mandarlo a filtro?\".","Si un socio solicita una ausencia, ¿qué detalles del caso debes documentar antes de entregar el formato para firma y cómo aseguras que el trámite quede correctamente registrado en el sistema?\".","Explícame cómo actualizas la pizarra de 0 accesos. Si logras que un socio regrese, ¿cuál es el proceso para marcar ese 'éxito' y cómo informas al resto del equipo para que le den una bienvenida especial cuando cruce la puerta?"]},{"semana":"Semana 3","preguntas":["Después del alta, al grabar la huella y tomar la foto, ¿cómo le explicarías a un socio nuevo el uso de la App para que sepa reservar sus servicios de manera autónoma?\".","En las clases de Pulse, ¿cuál es la importancia de validar la asistencia vía App al momento de la entrada y cómo reportas el aforo al grupo de WhatsApp?\".","Si un socio acude por su cheque de devolución, ¿qué documentos debes validar y qué debe firmar el socio para completar el resguardo legal de la póliza?\"."]},{"semana":"Semana 4","preguntas":["Cultura de Orden (5'S): \"¿Cómo aplicarías los principios de las 5'S en tu área de trabajo diaria y qué beneficios directos tiene esto en la experiencia del socio?","Si encuentras un objeto de valor en el club, describe el proceso desde la toma de fotografía hasta su envío a la bodega de resguardo y la entrega final al socio.\".","Si un socio te pregunta cómo canjear sus puntos de Rewards, ¿cuáles son los pasos para revisar su solicitud y llevar el registro correcto en el sistema (TG)?"]}]},"Ejecutivo de socios nuevos":{"departamento":"Administración","procesos":[{"n":1,"proceso":"Apertura de Club- Check list de limpieza","semana":"Semana 1","actividades":["Realizar el checklist revisando la limpieza de las áreas","Prender caminadoras, luces y aires","Abrir la caja en recepción","Prender computadoras"],"idx":0},{"n":2,"proceso":"Cierre de Club - Check list de limpieza","semana":"Semana 1","actividades":["Realizar Check list de todas la áreas en cuanto a limpieza","Revisar salones y estudios.","Apagar aires, luces, equipo de cardio y computadoras"],"idx":1},{"n":3,"proceso":"Check List de limpieza por turno","semana":"Semana 1","actividades":["Pasar por las áreas del club y revisar el contenido del checklist de limpieza.","Evaluar limpieza para calificación del turno.","Sacar promedio del checklist de los dos turnos.","Capturar los datos en la pizarra.","Dar retroalimnetación a Orden y Limpieza y Manetnimiento."],"idx":2},{"n":4,"proceso":"NPS","semana":"Semana 1","actividades":["Extraer los datos del día anterior de la base de datos.","Realizar las preguntas de seguimiento.","Pasar las respuestas a la bitacora.","Compartir al equipo la información relevante para la toma de desiciones.","Dar seguimiento con el área correspondiente.","Compartir el cierre de ciclo.","Llenado de pizarra."],"idx":3},{"n":5,"proceso":"Ausencias","semana":"Semana 1","actividades":["Bajar la base de datos.","Generar la base de ausencias.","Llenar información detallada del caso y entregar al socio para firma para documentar el tramite hecho por el titular.","Registrar en el sistema."],"idx":4},{"n":6,"proceso":"Bajas","semana":"Semana 1","actividades":["Recibir solicitud de baja.","Identifica si es temporal o definitiva.","Derivar con el líder de turno.","Realizar tramite de baja en el sistema.","Registrar en Drive y en pizarra, o en el sistema en caso de ser baja temporal."],"idx":5},{"n":7,"proceso":"Socios de Nuevo Ingreso","semana":"Semana 1","actividades":["Descargar la base del día anterior.","Revisar el Alta y cuadrar el alta fisica con la del sistema.","Descargar las fotos de los socios nuevos para mandar al grupo de WhatsApp.","Mandar mensaje de bienvenida al socio","Poner Stop en el sistema para proceso de bienvenida","Mandar clases y eventos especiales"],"idx":6},{"n":8,"proceso":"Cobranza en caja","semana":"Semana 2","actividades":["Recibir al socio","Recibir pagos de:","Membresia","Mensualidad","Otros articulos (Acuática, nutrición, etc.)"],"idx":7},{"n":9,"proceso":"Alta de Membresía","semana":"Semana 2","actividades":["Recibir al socio con la solicitud de Alta","Revisar que este firmada por líder de turno o gerente","Dar de alta en el sistema","Hacer el cobro en caja","Llenar los datos del socio para el cobro."],"idx":8},{"n":10,"proceso":"Cargos Automáticos","semana":"Semana 2","actividades":["Agregar los datos bancarios del socio a su perfil  en el sistema para que se realicen los cobros."],"idx":9},{"n":11,"proceso":"Elaboración del expediente / Físico y Digital","semana":"Semana 2","actividades":["Verificar que los datos estén completos.","Elaborar el expediente fisíco.","Validar el check list de Alta de Calidad","Mandar el expediente a filtro","Archivar el expediente"],"idx":10},{"n":12,"proceso":"Cambios de Titularidad (Casos especiales)","semana":"Semana 2","actividades":["Recibir solicitud.","Abrir un nuevo expediente.","Dar de alta en el sistema.","Registrar Perfil, Foto, Huella y App"],"idx":11},{"n":13,"proceso":"Cambios de Membresía (Casos especiales)","semana":"Semana 2","actividades":["Recibir solicitud","Derivar con R.P. o líder de turno.","Realizar el llenado de información y agregar integrantes en caso de que se cambie a una membresia de pareja o familiar.","Realizar el cambio en el sistema."],"idx":12},{"n":14,"proceso":"Tours","semana":"Semana 3","actividades":["Recibir al prospecto.","Derivar con un R.P.","Registrar en la bitácora de Tours."],"idx":13},{"n":15,"proceso":"Listas para las clases de Pulse","semana":"Semana 3","actividades":["Hacer la lista antes de la clase de Pulse","Checar las clases del día en la App.","Subir aforos al grupo de WhatsApp.","Anotar las listas en la tabla.","Validar la clase cuando entran los socios."],"idx":14},{"n":16,"proceso":"Ordenar micrófono (Salones y estudios)","semana":"Semana 3","actividades":["Mantener las pilas cargadas.","Entregar microfono al instructor.","Limpiar y resguardar."],"idx":15},{"n":17,"proceso":"Registro de accesos al club: pase de visita, tours","semana":"Semana 3","actividades":["Revisar si el visitante está anotado en la bitácora de Drive.","Marcar su asistencia.","Registrar al visitante."],"idx":16},{"n":18,"proceso":"Toma de Foto, Huella y Aplicación","semana":"Semana 3","actividades":["Recibir al socio en recepción después del llenado del Alta","Tomar la foto con la cámara del sistema","Grabar la huella desde el sistema","Apoyar al socio con la descarga de la app.","Explicar el uso de la app y como reservar los diferentes servicios."],"idx":17},{"n":19,"proceso":"Entrega de cheque de devolución","semana":"Semana 3","actividades":["Revisar en la carpeta de cheques","Entregar al socio con la entrega de una identificación","Sacar una copia a la identifiación","Recibir la poliza firmada."],"idx":18},{"n":20,"proceso":"Venta de prepagos (NAC)","semana":"Semana 3","actividades":["Comunicar al socio el precio de prepago","Cobrar en caja","Ingresar en sistema como estacionamiento"],"idx":19},{"n":21,"proceso":"Felicitación de cumpleaños","semana":"Semana 4","actividades":["Descargar la base de cumpleañeros","Realizar las imagenes en Canva con los Cumpleañeros, nombre y foto del socio","Mandar un mensaje individual de cumpleaños"],"idx":20},{"n":22,"proceso":"Objetos olvidados","semana":"Semana 4","actividades":["Reportar los objetos olvidados a Capitán de limpieza, recepción, líderes","Tomar foto y subir al grupo del club","Enviar a bodega asignada a su resguardo","Se entregar los objetos olvidados al socio"],"idx":21},{"n":23,"proceso":"Paquetería","semana":"Semana 4","actividades":["Recibir paquetería en recepción.","Mandar foto al grupo de Whatsapp y comunicar para quien es el paquete."],"idx":22},{"n":24,"proceso":"Validación de clases","semana":"Semana 4","actividades":["Estár en la entrada de la clase antes de empezar y validar la asistencia de los socios por medio de la app."],"idx":23},{"n":25,"proceso":"Firma de asistencia de instructores de salón","semana":"Semana 4","actividades":["Dar a firmar asistencia a los instructores de clases de salón","Validar las asistencias por medio de la app"],"idx":24},{"n":26,"proceso":"5´s","semana":"Semana 4","actividades":["Aplicar las 5´S en las áreas"],"idx":25},{"n":27,"proceso":"Rewards","semana":"Semana 4","actividades":["Dar información al socio sobre rewards o el canjeo de puntos","Revisar las solicitudes","Llevar a recepción lo necesario","Llevar un registro en TG"],"idx":26}],"total_procesos":27,"total_actividades":101,"autoevaluacion":[{"semana":"Semana 1","preguntas":["Una vez que el socio entrega su solicitud firmada por el líder o gerente, ¿cuáles son los pasos exactos que sigues en el sistema para darlo de alta y qué elementos debes validar antes de que el socio pase a su primer entrenamiento?","¿Por qué es fundamental no solo registrar las respuestas de NPS en la bitácora, sino compartir la información relevante con el equipo y dar seguimiento al área correspondiente?","Al revisar el alta física contra el sistema, ¿qué datos específicos son los que 'cruzas' para asegurar que no haya errores y qué haces si detectas que la información en el sistema no coincide con el papel?"]},{"semana":"Semana 2","preguntas":["Durante la elaboración de un expediente físico y digital, ¿qué puntos específicos revisas para asegurar que los datos estén completos antes de mandarlo a filtro?\".","Si un socio solicita una ausencia, ¿qué detalles del caso debes documentar antes de entregar el formato para firma y cómo aseguras que el trámite quede correctamente registrado en el sistema?\".","Si al realizar el checklist de limpieza detectas que el área de cardio no cumple con el estándar de limpieza, ¿cuál es el protocolo a seguir para la retroalimentación con el equipo?\"."]},{"semana":"Semana 3","preguntas":["Después del alta, al grabar la huella y tomar la foto, ¿cómo le explicarías a un socio nuevo el uso de la App para que sepa reservar sus servicios de manera autónoma?\".","En las clases de Pulse, ¿cuál es la importancia de validar la asistencia vía App al momento de la entrada y cómo reportas el aforo al grupo de WhatsApp?\".","Si un socio acude por su cheque de devolución, ¿qué documentos debes validar y qué debe firmar el socio para completar el resguardo legal de la póliza?\"."]},{"semana":"Semana 4","preguntas":["Cultura de Orden (5'S): \"¿Cómo aplicarías los principios de las 5'S en tu área de trabajo diaria y qué beneficios directos tiene esto en la experiencia del socio?","Si encuentras un objeto de valor en el club, describe el proceso desde la toma de fotografía hasta su envío a la bodega de resguardo y la entrega final al socio.\".","Si un socio te pregunta cómo canjear sus puntos de Rewards, ¿cuáles son los pasos para revisar su solicitud y llevar el registro correcto en el sistema (TG)?"]}]},"Ejecutivo de socios +3 meses":{"departamento":"Administración","procesos":[{"n":1,"proceso":"Apertura de Club- Check list de limpieza","semana":"Semana 1","actividades":["Realizar el checklist revisando la limpieza de las áreas","Prender caminadoras, luces y aires","Abrir la caja en recepción","Prender computadoras"],"idx":0},{"n":2,"proceso":"Cierre de Club - Check list de limpieza","semana":"Semana 1","actividades":["Realizar Check list de todas la áreas en cuanto a limpieza","Revisar salones y estudios.","Apagar aires, luces, equipo de cardio y computadoras"],"idx":1},{"n":3,"proceso":"Check List de limpieza por turno","semana":"Semana 1","actividades":["Pasar por las áreas del club y revisar el contenido del checklist de limpieza.","Evaluar limpieza para calificación del turno.","Sacar promedio del checklist de los dos turnos.","Capturar los datos en la pizarra.","Dar retroalimnetación a Orden y Limpieza y Manetnimiento."],"idx":2},{"n":4,"proceso":"NPS","semana":"Semana 1","actividades":["Extraer los datos del día anterior de la base de datos.","Realizar las preguntas de seguimiento.","Pasar las respuestas a la bitacora.","Compartir al equipo la información relevante para la toma de desiciones.","Dar seguimiento con el área correspondiente.","Compartir el cierre de ciclo.","Llenado de pizarra."],"idx":3},{"n":5,"proceso":"Ausencias","semana":"Semana 1","actividades":["Bajar la base de datos.","Generar la base de ausencias.","Llenar información detallada del caso y entregar al socio para firma para documentar el tramite hecho por el titular.","Registrar en el sistema."],"idx":4},{"n":6,"proceso":"Bajas","semana":"Semana 1","actividades":["Recibir solicitud de baja.","Identifica si es temporal o definitiva.","Derivar con el líder de turno.","Realizar tramite de baja en el sistema.","Registrar en Drive y en pizarra, o en el sistema en caso de ser baja temporal."],"idx":5},{"n":7,"proceso":"Socios de un año o menos (a partir de 3 meses)","semana":"Semana 1","actividades":["Descargar la base de datos","Mandar encuesta de:","3 meses","9 meses","1 año"],"idx":6},{"n":8,"proceso":"Cobranza en caja","semana":"Semana 2","actividades":["Recibir al socio","Recibir pagos de:","Membresia","Mensualidad","Otros articulos (Acuática, nutrición, etc.)"],"idx":7},{"n":9,"proceso":"Alta de Membresía","semana":"Semana 2","actividades":["Recibir al socio con la solicitud de Alta","Revisar que este firmada por líder de turno o gerente","Dar de alta en el sistema","Hacer el cobro en caja","Llenar los datos del socio para el cobro."],"idx":8},{"n":10,"proceso":"Cargos Automáticos","semana":"Semana 2","actividades":["Agregar los datos bancarios del socio a su perfil  en el sistema para que se realicen los cobros."],"idx":9},{"n":11,"proceso":"Elaboración del expediente / Físico y Digital","semana":"Semana 2","actividades":["Verificar que los datos estén completos.","Elaborar el expediente fisíco.","Validar el check list de Alta de Calidad","Mandar el expediente a filtro","Archivar el expediente"],"idx":10},{"n":12,"proceso":"Cambios de Titularidad (Casos especiales)","semana":"Semana 2","actividades":["Recibir solicitud.","Abrir un nuevo expediente.","Dar de alta en el sistema.","Registrar Perfil, Foto, Huella y App"],"idx":11},{"n":13,"proceso":"Cambios de Membresía (Casos especiales)","semana":"Semana 2","actividades":["Recibir solicitud","Derivar con R.P. o líder de turno.","Realizar el llenado de información y agregar integrantes en caso de que se cambie a una membresia de pareja o familiar.","Realizar el cambio en el sistema."],"idx":12},{"n":14,"proceso":"Tours","semana":"Semana 3","actividades":["Recibir al prospecto.","Derivar con un R.P.","Registrar en la bitácora de Tours."],"idx":13},{"n":15,"proceso":"Listas para las clases de Pulse","semana":"Semana 3","actividades":["Hacer la lista antes de la clase de Pulse","Checar las clases del día en la App.","Subir aforos al grupo de WhatsApp.","Anotar las listas en la tabla.","Validar la clase cuando entran los socios."],"idx":14},{"n":16,"proceso":"Ordenar micrófono (Salones y estudios)","semana":"Semana 3","actividades":["Mantener las pilas cargadas.","Entregar microfono al instructor.","Limpiar y resguardar."],"idx":15},{"n":17,"proceso":"Registro de accesos al club: pase de visita, tours","semana":"Semana 3","actividades":["Revisar si el visitante está anotado en la bitácora de Drive.","Marcar su asistencia.","Registrar al visitante."],"idx":16},{"n":18,"proceso":"Toma de Foto, Huella y Aplicación","semana":"Semana 3","actividades":["Recibir al socio en recepción después del llenado del Alta","Tomar la foto con la cámara del sistema","Grabar la huella desde el sistema","Apoyar al socio con la descarga de la app.","Explicar el uso de la app y como reservar los diferentes servicios."],"idx":17},{"n":19,"proceso":"Entrega de cheque de devolución","semana":"Semana 3","actividades":["Revisar en la carpeta de cheques","Entregar al socio con la entrega de una identificación","Sacar una copia a la identifiación","Recibir la poliza firmada."],"idx":18},{"n":20,"proceso":"Venta de prepagos (NAC)","semana":"Semana 3","actividades":["Comunicar al socio el precio de prepago","Cobrar en caja","Ingresar en sistema como estacionamiento"],"idx":19},{"n":21,"proceso":"Felicitación de cumpleaños","semana":"Semana 4","actividades":["Descargar la base de cumpleañeros","Realizar las imagenes en Canva con los Cumpleañeros, nombre y foto del socio","Mandar un mensaje individual de cumpleaños"],"idx":20},{"n":22,"proceso":"Objetos olvidados","semana":"Semana 4","actividades":["Reportar los objetos olvidados a Capitán de limpieza, recepción, líderes","Tomar foto y subir al grupo del club","Enviar a bodega asignada a su resguardo","Se entregar los objetos olvidados al socio"],"idx":21},{"n":23,"proceso":"Paquetería","semana":"Semana 4","actividades":["Recibir paquetería en recepción.","Mandar foto al grupo de Whatsapp y comunicar para quien es el paquete."],"idx":22},{"n":24,"proceso":"Validación de clases","semana":"Semana 4","actividades":["Estár en la entrada de la clase antes de empezar y validar la asistencia de los socios por medio de la app."],"idx":23},{"n":25,"proceso":"Firma de asistencia de instructores de salón","semana":"Semana 4","actividades":["Dar a firmar asistencia a los instructores de clases de salón","Validar las asistencias por medio de la app"],"idx":24},{"n":26,"proceso":"5´s","semana":"Semana 4","actividades":["Aplicar las 5´S en las áreas"],"idx":25},{"n":27,"proceso":"Rewards","semana":"Semana 4","actividades":["Dar información al socio sobre rewards o el canjeo de puntos","Revisar las solicitudes","Llevar a recepción lo necesario","Llevar un registro en TG"],"idx":26}],"total_procesos":27,"total_actividades":100,"autoevaluacion":[{"semana":"Semana 1","preguntas":["Al descargar la base de datos de socios con más de 3 meses, ¿cómo realizas la segmentación por antigüedad y cuál es tu estrategia de contacto\".","¿Por qué es fundamental no solo registrar las respuestas de NPS en la bitácora, sino compartir la información relevante con el equipo y dar seguimiento al área correspondiente?","Qué estrategias utilizarías para seguir conetando con los socios, que sigan asistiendo al club y se quedén más de un año con nosotros?"]},{"semana":"Semana 2","preguntas":["Durante la elaboración de un expediente físico y digital, ¿qué puntos específicos revisas para asegurar que los datos estén completos antes de mandarlo a filtro?\".","Si un socio solicita una ausencia, ¿qué detalles del caso debes documentar antes de entregar el formato para firma y cómo aseguras que el trámite quede correctamente registrado en el sistema?\".","Si al realizar el checklist de limpieza detectas que el área de cardio no cumple con el estándar de limpieza, ¿cuál es el protocolo a seguir para la retroalimentación con el equipo?\"."]},{"semana":"Semana 3","preguntas":["Después del alta, al grabar la huella y tomar la foto, ¿cómo le explicarías a un socio nuevo el uso de la App para que sepa reservar sus servicios de manera autónoma?\".","En las clases de Pulse, ¿cuál es la importancia de validar la asistencia vía App al momento de la entrada y cómo reportas el aforo al grupo de WhatsApp?\".","Si un socio acude por su cheque de devolución, ¿qué documentos debes validar y qué debe firmar el socio para completar el resguardo legal de la póliza?\"."]},{"semana":"Semana 4","preguntas":["Cultura de Orden (5'S): \"¿Cómo aplicarías los principios de las 5'S en tu área de trabajo diaria y qué beneficios directos tiene esto en la experiencia del socio?","Si encuentras un objeto de valor en el club, describe el proceso desde la toma de fotografía hasta su envío a la bodega de resguardo y la entrega final al socio.\".","Si un socio te pregunta cómo canjear sus puntos de Rewards, ¿cuáles son los pasos para revisar su solicitud y llevar el registro correcto en el sistema (TG)?"]}]},"Caja":{"departamento":"Administración","procesos":[{"n":1,"proceso":"NPS","semana":"Semana 1","actividades":["Extraer los datos del día anterior de la base de datos.","Realizar las preguntas de seguimiento.","Pasar las respuestas a la bitacora.","Compartir al equipo la información relevante para la toma de desiciones.","Dar seguimiento con el área correspondiente.","Compartir el cierre de ciclo.","Llenado de pizarra."],"idx":0},{"n":2,"proceso":"Bajas","semana":"Semana 1","actividades":["Recibir solicitud de baja.","Identifica si es temporal o definitiva.","Derivar con el líder de turno."],"idx":1},{"n":3,"proceso":"Cobranza en caja","semana":"Semana 2","actividades":["Recibir al socio","Recibir pagos de:","Membresia","Mensualidad","Otros articulos (Acuática, nutrición, etc.)"],"idx":2},{"n":4,"proceso":"Alta de Membresía","semana":"Semana 2","actividades":["Recibir al socio con la solicitud de Alta","Revisar que este firmada por líder de turno o gerente","Dar de alta en el sistema","Hacer el cobro en caja","Llenar los datos del socio para el cobro."],"idx":3},{"n":5,"proceso":"Cargos Automáticos","semana":"Semana 2","actividades":["Agregar los datos bancarios del socio a su perfil  en el sistema para que se realicen los cobros."],"idx":4},{"n":6,"proceso":"Elaboración del expediente / Físico y Digital","semana":"Semana 2","actividades":["Verificar que los datos estén completos.","Elaborar el expediente fisíco.","Validar el check list de Alta de Calidad","Mandar el expediente a filtro","Archivar el expediente"],"idx":5},{"n":7,"proceso":"Tours","semana":"Semana 3","actividades":["Recibir al prospecto.","Derivar con un R.P.","Registrar en la bitácora de Tours."],"idx":6},{"n":8,"proceso":"Listas para las clases de Pulse","semana":"Semana 3","actividades":["Hacer la lista antes de la clase de Pulse","Checar las clases del día en la App.","Subir aforos al grupo de WhatsApp.","Anotar las listas en la tabla.","Validar la clase cuando entran los socios."],"idx":7},{"n":9,"proceso":"Ordenar micrófono (Salones y estudios)","semana":"Semana 3","actividades":["Mantener las pilas cargadas.","Entregar microfono al instructor.","Limpiar y resguardar."],"idx":8},{"n":10,"proceso":"Registro de accesos al club: pase de visita, tours","semana":"Semana 3","actividades":["Revisar si el visitante está anotado en la bitácora de Drive.","Marcar su asistencia.","Registrar al visitante."],"idx":9},{"n":11,"proceso":"Toma de Foto, Huella y Aplicación","semana":"Semana 3","actividades":["Recibir al socio en recepción después del llenado del Alta","Tomar la foto con la cámara del sistema","Grabar la huella desde el sistema","Apoyar al socio con la descarga de la app.","Explicar el uso de la app y como reservar los diferentes servicios."],"idx":10},{"n":12,"proceso":"Entrega de cheque de devolución","semana":"Semana 3","actividades":["Revisar en la carpeta de cheques","Entregar al socio con la entrega de una identificación","Sacar una copia a la identifiación","Recibir la poliza firmada."],"idx":11},{"n":13,"proceso":"Venta de prepagos (NAC)","semana":"Semana 3","actividades":["Comunicar al socio el precio de prepago","Cobrar en caja","Ingresar en sistema como estacionamiento"],"idx":12},{"n":14,"proceso":"Felicitación de cumpleaños","semana":"Semana 4","actividades":["Descargar la base de cumpleañeros","Realizar las imagenes en Canva con los Cumpleañeros, nombre y foto del socio","Mandar un mensaje individual de cumpleaños"],"idx":13},{"n":15,"proceso":"Objetos olvidados","semana":"Semana 4","actividades":["Reportar los objetos olvidados a Capitán de limpieza, recepción, líderes","Tomar foto y subir al grupo del club","Enviar a bodega asignada a su resguardo","Se entregar los objetos olvidados al socio"],"idx":14},{"n":16,"proceso":"Paquetería","semana":"Semana 4","actividades":["Recibir paquetería en recepción.","Mandar foto al grupo de Whatsapp y comunicar para quien es el paquete."],"idx":15},{"n":17,"proceso":"Validación de clases","semana":"Semana 4","actividades":["Estár en la entrada de la clase antes de empezar y validar la asistencia de los socios por medio de la app."],"idx":16},{"n":18,"proceso":"Firma de asistencia de instructores de salón","semana":"Semana 4","actividades":["Dar a firmar asistencia a los instructores de clases de salón","Validar las asistencias por medio de la app"],"idx":17},{"n":19,"proceso":"5´s","semana":"Semana 4","actividades":["Aplicar las 5´S en las áreas"],"idx":18},{"n":20,"proceso":"Rewards","semana":"Semana 4","actividades":["Dar información al socio sobre rewards o el canjeo de puntos","Revisar las solicitudes","Llevar a recepción lo necesario","Llevar un registro en TG"],"idx":19}],"total_procesos":20,"total_actividades":69},"Recepción":{"departamento":"Administración","procesos":[{"n":1,"proceso":"NPS","semana":"Semana 1","actividades":["Extraer los datos del día anterior de la base de datos.","Realizar las preguntas de seguimiento.","Pasar las respuestas a la bitacora.","Compartir al equipo la información relevante para la toma de desiciones.","Dar seguimiento con el área correspondiente.","Compartir el cierre de ciclo.","Llenado de pizarra."],"idx":0},{"n":2,"proceso":"Bajas","semana":"Semana 1","actividades":["Recibir solicitud de baja.","Identifica si es temporal o definitiva.","Derivar con el líder de turno."],"idx":1},{"n":3,"proceso":"Cobranza en caja","semana":"Semana 2","actividades":["Recibir al socio","Recibir pagos de:","Membresia","Mensualidad","Otros articulos (Acuática, nutrición, etc.)"],"idx":2},{"n":4,"proceso":"Alta de Membresía","semana":"Semana 2","actividades":["Recibir al socio con la solicitud de Alta","Revisar que este firmada por líder de turno o gerente","Dar de alta en el sistema","Hacer el cobro en caja","Llenar los datos del socio para el cobro."],"idx":3},{"n":5,"proceso":"Cargos Automáticos","semana":"Semana 2","actividades":["Agregar los datos bancarios del socio a su perfil  en el sistema para que se realicen los cobros."],"idx":4},{"n":6,"proceso":"Elaboración del expediente / Físico y Digital","semana":"Semana 2","actividades":["Verificar que los datos estén completos.","Elaborar el expediente fisíco.","Validar el check list de Alta de Calidad","Mandar el expediente a filtro","Archivar el expediente"],"idx":5},{"n":7,"proceso":"Tours","semana":"Semana 3","actividades":["Recibir al prospecto.","Derivar con un R.P.","Registrar en la bitácora de Tours."],"idx":6},{"n":8,"proceso":"Listas para las clases de Pulse","semana":"Semana 3","actividades":["Hacer la lista antes de la clase de Pulse","Checar las clases del día en la App.","Subir aforos al grupo de WhatsApp.","Anotar las listas en la tabla.","Validar la clase cuando entran los socios."],"idx":7},{"n":9,"proceso":"Ordenar micrófono (Salones y estudios)","semana":"Semana 3","actividades":["Mantener las pilas cargadas.","Entregar microfono al instructor.","Limpiar y resguardar."],"idx":8},{"n":10,"proceso":"Registro de accesos al club: pase de visita, tours","semana":"Semana 3","actividades":["Revisar si el visitante está anotado en la bitácora de Drive.","Marcar su asistencia.","Registrar al visitante."],"idx":9},{"n":11,"proceso":"Toma de Foto, Huella y Aplicación","semana":"Semana 3","actividades":["Recibir al socio en recepción después del llenado del Alta","Tomar la foto con la cámara del sistema","Grabar la huella desde el sistema","Apoyar al socio con la descarga de la app.","Explicar el uso de la app y como reservar los diferentes servicios."],"idx":10},{"n":12,"proceso":"Entrega de cheque de devolución","semana":"Semana 3","actividades":["Revisar en la carpeta de cheques","Entregar al socio con la entrega de una identificación","Sacar una copia a la identifiación","Recibir la poliza firmada."],"idx":11},{"n":13,"proceso":"Venta de prepagos (NAC)","semana":"Semana 3","actividades":["Comunicar al socio el precio de prepago","Cobrar en caja","Ingresar en sistema como estacionamiento"],"idx":12},{"n":14,"proceso":"Felicitación de cumpleaños","semana":"Semana 4","actividades":["Descargar la base de cumpleañeros","Realizar las imagenes en Canva con los Cumpleañeros, nombre y foto del socio","Mandar un mensaje individual de cumpleaños"],"idx":13},{"n":15,"proceso":"Objetos olvidados","semana":"Semana 4","actividades":["Reportar los objetos olvidados a Capitán de limpieza, recepción, líderes","Tomar foto y subir al grupo del club","Enviar a bodega asignada a su resguardo","Se entregar los objetos olvidados al socio"],"idx":14},{"n":16,"proceso":"Paquetería","semana":"Semana 4","actividades":["Recibir paquetería en recepción.","Mandar foto al grupo de Whatsapp y comunicar para quien es el paquete."],"idx":15},{"n":17,"proceso":"Validación de clases","semana":"Semana 4","actividades":["Estár en la entrada de la clase antes de empezar y validar la asistencia de los socios por medio de la app."],"idx":16},{"n":18,"proceso":"Firma de asistencia de instructores de salón","semana":"Semana 4","actividades":["Dar a firmar asistencia a los instructores de clases de salón","Validar las asistencias por medio de la app"],"idx":17},{"n":19,"proceso":"5´s","semana":"Semana 4","actividades":["Aplicar las 5´S en las áreas"],"idx":18},{"n":20,"proceso":"Rewards","semana":"Semana 4","actividades":["Dar información al socio sobre rewards o el canjeo de puntos","Revisar las solicitudes","Llevar a recepción lo necesario","Llevar un registro en TG"],"idx":19}],"total_procesos":20,"total_actividades":69},"Líder Deportivo":{"departamento":"Deportes","procesos":[{"n":1,"proceso":"Conocer la oferta deportiva","semana":"Semana 1","actividades":["Presentación de instructores o colaboradores clave.","Descripción de clases y horarios","Información sobre clases especiales","Invitación a participar en las clases o audiciones","Explicación de los equipos del área","Explicación de las narrativas de los estudios","Explicación de las áreas complementarias"],"idx":0},{"n":2,"proceso":"Cuadrantes área de fuerza","semana":"Semana 1","actividades":["Identificar cuadrantes del área","Organizar cuadrantes entre número de coaches","Establecer un rol (peridiocidad)","Atender a socios del área","Derivar a los socios","5´s"],"idx":1},{"n":3,"proceso":"Asignar rutinas","semana":"Semana 1","actividades":["Entrevista Inicial","Llevar al socio a Nutrición (Consulta y Prueba Inbody)","Planeación de la rutina","Hacer la plantilla de la rutina","Acercarse con el socio","Seguimiento","Segunda Entrevista (Cambio de rutina)","Ajuste o realización de la siguiente rutina"],"idx":2},{"n":4,"proceso":"Asignar socios a Coaches","semana":"Semana 1","actividades":["Comunicación Incial","Cambio de coach por:","Reactivación","Socio nuevo","Preguntas iniciales al socio","Asignar a un coach"],"idx":3},{"n":5,"proceso":"Uso de Radios","semana":"Semana 1","actividades":["Comunicar Hora de desacanso","Comunicar si salen del área","Comunicar si hay un socio buscando a un colaborador","Apoyar a compañeros","Detectar equipo en malas condiciones","Incidencia en el área","Asignar socios"],"idx":4},{"n":6,"proceso":"Orden del área de fuerza","semana":"Semana 1","actividades":["5´s","Acomodar discos, mancuernas, etc.","Apagado de área de fuerza","Apagado de estudios"],"idx":5},{"n":7,"proceso":"Evaluación al socio","semana":"Semana 1","actividades":["Evaluación inicial de nutrición","Padecimientos, lesión","Historial deportivo","Examen fisico","Derivar a mobility","Ejercicios simples","Test de resistencia aerobica"],"idx":6},{"n":8,"proceso":"Recibimiento Incial","semana":"Semana 1","actividades":["Bienvenida del socio","Mostrar la oferta deportiva","Preguntar por objetivos","Presentar oferta de clases","Presentar oferta de comunidad"],"idx":7},{"n":9,"proceso":"Preparación de  salones/área de fuerza (Apertura)","semana":"Semana 2","actividades":["Revisar que las luces funciones","Checar limpieza","Acomodo del equipo","Checar la consola","Entregar diadema al instructor","Checar que el equipo sirva durante la clase"],"idx":8},{"n":10,"proceso":"Reportar equipos en mal estado","semana":"Semana 2","actividades":["Reporte de los colaboradores","Reporte de equipo a operaciones","Se levanta ticket","Seguimiento"],"idx":9},{"n":11,"proceso":"Reportar incidencias","semana":"Semana 2","actividades":["Incidencias del área","Objetos olvidados","Reporte de vacaciones, faltas o incapacidades","Reporte a sistemas"],"idx":10},{"n":12,"proceso":"Abastecimiento de materiales","semana":"Semana 2","actividades":["Hacer el reporte","Se reporta con el gerente","Validar que se solicitó el material","Seguimiento (Frecuencia Semanal/Quincenal)","Validar entrega de equipo o material y asignarlo al área correspondiente."],"idx":11},{"n":13,"proceso":"Música","semana":"Semana 2","actividades":["Se pone el audio desde la computadora del Líder Deportivo","Se quita desde la computadora"],"idx":12},{"n":14,"proceso":"Cantidad Socios en cartera","semana":"Semana 2","actividades":["Se hace limpieza de cartera","Reponer socios","Se pasa los datos a ejecutivos (Ausencias)","Se hace seguimiento"],"idx":13},{"n":15,"proceso":"Checklist","semana":"Semana 2","actividades":["Mejoras en el área","Se reporta lo faltante","Incidencia de equipo","Reporte entre turnos"],"idx":14},{"n":16,"proceso":"Propuestas de rutina, Mobility","semana":"Semana 3","actividades":["Se pasan rutinas para la semana","Se rolan las rutinas","Seguimiento"],"idx":15},{"n":17,"proceso":"Registrar aforos, Mobility","semana":"Semana 3","actividades":["Mobility lleva la agenda de aforos","Vaciado a TG","Historial de aforos","Validar el calculo de bono y metas diarias"],"idx":16},{"n":18,"proceso":"Validar citas Nutrición","semana":"Semana 3","actividades":["Se valida en TG","Validar áreas de oportunidad con Nutrición","Validar datos para calculo del bono"],"idx":17},{"n":19,"proceso":"Workshops","semana":"Semana 3","actividades":["Nuevos Lineamientos","Alinear Áreas","Juntas de Deportes","Revisar procesos de servicio","Lluvia de Ideas","Cambios de equipo"],"idx":18},{"n":20,"proceso":"Presentación del socio","semana":"Semana 3","actividades":["Seguimiento de prótocolo","Estandares de Servicio","Aviso de nuevo Ingreso","Recibimiento","Evaluación","Tour de las instalaciones","Derivación a Mobility","Se asigna un coach"],"idx":19},{"n":21,"proceso":"Usuario de Avena, Nutrición","semana":"Semana 3","actividades":["Validar que el nutriologo tenga su usuario"],"idx":20},{"n":22,"proceso":"Abrir Agendas","semana":"Semana 3","actividades":["Apartado de empleados en TG","Habilitar Agenda","Habilitar de acuerdo a horarios"],"idx":21},{"n":23,"proceso":"Revisar limpieza de estudios","semana":"Semana 4","actividades":["Visita a los salones, estudios y cardio","Reporte a Orden y limpieza","Checklist de limpieza"],"idx":22},{"n":24,"proceso":"Apagar/prender equipos","semana":"Semana 4","actividades":["Prender aires acondicionados","Prender escaladoras","Prender caminadoras","Apagar Caminadoras/FT","Apagar Escaladoras","Apagar aires","Revisar estudios"],"idx":23},{"n":25,"proceso":"5´s","semana":"Semana 4","actividades":["Llevar materiales en mal estado a zona roja","Organizar mancuernas, equipo y discos (Color, peso de manera ascendente)","Hacer limpieza rapida del área"],"idx":24},{"n":26,"proceso":"Validar citas, Coach de Estiramiento","semana":"Semana 4","actividades":["Validar desde computadora a socios sin cita","Notificar a Administración de deportes"],"idx":25},{"n":27,"proceso":"Clases especiales","semana":"Semana 4","actividades":["Hacer planificación mensual de clases especiales","Coordinar con marketing las necesidades de la clase","Validar ejecución correcta con cumplimiento de estandares"],"idx":26},{"n":28,"proceso":"Calendario de clases","semana":"Semana 4","actividades":["Medir el progreso de aforo semanal","Identificar clases en semaforo rojo","Reportar a coordinador de clases y experiencias","Evaluar continuidad de la clase en el siguiente horario mensual"],"idx":27},{"n":29,"proceso":"Tutoriales","semana":"Semana 4","actividades":["Gestionar de manera mensual las ventas de cada tutorial","Dar retro sobre estado actual de ventas","Asignar posibles prospectos para entrenamiento","Asegurar cumplimiento de metas y dar retro de áreas de mejora"],"idx":28}],"total_procesos":29,"total_actividades":133},"Coach Deportivo":{"departamento":"Deportes","procesos":[{"n":1,"proceso":"Conocer la oferta deportiva","semana":"Semana 1","actividades":["Presentación de instructores o colaboradores clave.","Descripción de clases y horarios","Información sobre clases especiales","Invitación a participar en las clases o audiciones","Explicación de los equipos del área","Explicación de las narrativas de los estudios","Explicación de las áreas complementarias"],"idx":0},{"n":2,"proceso":"Cuadrantes área de fuerza","semana":"Semana 1","actividades":["Identificar cuadrantes del área","Organizar cuadrantes entre número de coaches","Establecer un rol (peridiocidad)","Atender a socios del área","Derivar a los socios","5´s"],"idx":1},{"n":3,"proceso":"Asignar rutinas","semana":"Semana 1","actividades":["Entrevista Inicial","Llevar al socio a Nutrición (Consulta y Prueba Inbody)","Planeación de la rutina","Hacer la plantilla de la rutina","Acercarse con el socio","Seguimiento","Segunda Entrevista","Ajuste o realización de la siguiente rutina"],"idx":2},{"n":4,"proceso":"Uso de Radios","semana":"Semana 1","actividades":["Comunicar Hora de desacanso","Comunicar si salen del área","Comunicar si hay un socio buscando a un colaborador","Apoyar a compañeros","Detectar equipo en malas condiciones","Incidencia en el área","Asignar socios"],"idx":3},{"n":5,"proceso":"Orden del área de fuerza","semana":"Semana 1","actividades":["5´s","Acomodar discos, mancuernas, etc.","Apagado de área de fuerza","Apagado de estudios"],"idx":4},{"n":6,"proceso":"Evaluación al socio","semana":"Semana 2","actividades":["Padecimientos, lesión","Historial deportivo","Examen fisico","Derivar a mobility","Ejercicios simples","Test de resistencia aerobica"],"idx":5},{"n":7,"proceso":"Recibimiento Inicial","semana":"Semana 2","actividades":["Bienvenida del socio","Mostrar la oferta","Preguntar por objetivos","Presentar oferta de clases","Presentar oferta de comunidad"],"idx":6},{"n":8,"proceso":"Correción de posturas","semana":"Semana 2","actividades":["Visualizar si al socio lo entrena alguien","Comunicar a coach del entreno por medio del radio","Acercarse al socio","Abordar","Corregir","En caso de que el socio no tenga coach asignado, agregar a su cartera"],"idx":7},{"n":9,"proceso":"Reportar equipos en mal estado","semana":"Semana 2","actividades":["Reporte de los colaboradores sobre el equipo","Se reporta al grupo de operaciones","Se levanta ticket","Seguimiento"],"idx":8},{"n":10,"proceso":"Cantidad Socios en cartera","semana":"Semana 3","actividades":["Reponer socios","Reportar al líder para asignar socios nuevos","Aplicar proceso de asignación de rutina"],"idx":9},{"n":11,"proceso":"Checklist","semana":"Semana 3","actividades":["Mejoras en el área","Se reporta lo faltante","Incidencia de equipo","Reportar entre turnos"],"idx":10},{"n":12,"proceso":"Workshops","semana":"Semana 3","actividades":["Nuevos Lineamientos","Alinear Áreas","Juntas de Deportes","Revisar procesos de servicio","Lluvia de Ideas","Cambios de equipo"],"idx":11},{"n":13,"proceso":"Atención al socio","semana":"Semana 3","actividades":["Recibimiento","Estandares de servicio","Especificación del servicio de acuerdo a objetivos"],"idx":12},{"n":14,"proceso":"Seguimiento al socio","semana":"Semana 4","actividades":["Correción de posturas","Evaluar si es necesario cambio de rutina o modificar propuestas de ejercicios"],"idx":13},{"n":15,"proceso":"Política de apariencia","semana":"Semana 4","actividades":["Detectar y reportar a líder deportivo o de turno"],"idx":14},{"n":16,"proceso":"Apagar/prender equipos","semana":"Semana 4","actividades":["Prender aires acondicionados","Prender escaladoras","Prender caminadoras","Apagar Caminadoras/FT","Apagar Escaladoras","Apagar aires","Revisar estudios"],"idx":15},{"n":17,"proceso":"5´s","semana":"Semana 4","actividades":["Llevar materiales en mal estado a zona roja","Organizar mancuernas, equipo y discos","Hacer limpieza rapida del área"],"idx":16}],"total_procesos":17,"total_actividades":82},"Coach de Estiramiento":{"departamento":"Deportes","procesos":[{"n":1,"proceso":"Conocer la oferta deportiva","semana":"Semana 1","actividades":["Presentación de instructores o colaboradores clave.","Descripción de clases y horarios","Información sobre clases especiales","Invitación a participar en las clases o audiciones","Explicación de los equipos del área","Explicación de las narrativas de los estudios","Explicación de las áreas complementarias"],"idx":0},{"n":2,"proceso":"Uso de Radios","semana":"Semana 1","actividades":["Comunicar hora de desacanso","Comunicar si salen del área","Comunicar si hay un socio buscando a un colaborador","Apoyar a compañeros","Detectar equipo en malas condiciones","Incidencia en el área"],"idx":1},{"n":3,"proceso":"Recibimiento Inicial","semana":"Semana 1","actividades":["Bienvenida del socio","Mostrar la oferta","Preguntar por servicio deseado (Estiramiento o relajación)"],"idx":2},{"n":4,"proceso":"Reportar equipos y material en mal estado","semana":"Semana 2","actividades":["Reporte de los colaboradores sobre el equipo y materiales","Seguimiento"],"idx":3},{"n":5,"proceso":"Workshops","semana":"Semana 2","actividades":["Nuevos Lineamientos","Alinear Áreas","Juntas de Deportes","Revisar procesos de servicio","Lluvia de Ideas","Cambios de equipo"],"idx":4},{"n":6,"proceso":"Cambio de toallas","semana":"Semana 2","actividades":["Stock principio de turno","Re stock de toallas","Entrega de toallas usadas a vestidores","Uso de fundas de cabecera"],"idx":5},{"n":7,"proceso":"Mantener materiales limpios, Estiramiento","semana":"Semana 3","actividades":["Limpieza y desinfeción de equipo entre cada cita","Recoger Toallas"],"idx":6},{"n":8,"proceso":"Atención al socio","semana":"Semana 3","actividades":["Recibimiento","Estandares de servicio","Especificación del servicio de acuerdo a lo trabajado por el socio"],"idx":7},{"n":9,"proceso":"5´s","semana":"Semana 4","actividades":["Llevar materiales en mal estado a zona roja","Organizar materiales","Hacer limpieza rapida del área"],"idx":8},{"n":10,"proceso":"Validar citas, Estiramiento","semana":"Semana 4","actividades":["Validar citas desde la aplicación","Reportar al líder espacios disponibles para agendar socios"],"idx":9}],"total_procesos":10,"total_actividades":38},"Nutrición":{"departamento":"Deportes","procesos":[{"n":1,"proceso":"Conocer la oferta deportiva","semana":"Semana 1","actividades":["Presentación de instructores o colaboradores clave.","Descripción de clases y horarios","Información sobre clases especiales","Invitación a participar en las clases o audiciones","Explicación de los equipos del área","Explicación de las narrativas de los estudios","Explicación de las áreas complementarias"],"idx":0},{"n":2,"proceso":"Asignar socios a Coaches","semana":"Semana 1","actividades":["Comunicación Inicial","Preguntas iniciales al socio","Validar con líder de deportes coach a asignar"],"idx":1},{"n":3,"proceso":"Evaluación al socio","semana":"Semana 1","actividades":["Evaluación inicial de nutrición","Inbody","Toma de medidas","Pesaje","Padecimientos, lesión","Historial deportivo","Examen fisico","Derivar a mobility en caso de que el socio venga a entrenar"],"idx":2},{"n":4,"proceso":"Recibimiento","semana":"Semana 1","actividades":["Bienvenida del socio","Mostrar la oferta","Preguntar por objetivos"],"idx":3},{"n":5,"proceso":"Reportar equipos en mal estado","semana":"Semana 2","actividades":["Reporte de los colaboradores acerca de equipo o material en mal estado","Seguimiento"],"idx":4},{"n":6,"proceso":"Validar citas, Nutrición","semana":"Semana 2","actividades":["Se valida en TG","Reportar al líder espacios disponibles para agendar socios"],"idx":5},{"n":7,"proceso":"Workshops","semana":"Semana 2","actividades":["Nuevos Lineamientos","Alinear Áreas","Juntas de Deportes","Revisar procesos de servicio","Lluvia de Ideas","Cambios de equipo"],"idx":6},{"n":9,"proceso":"Atención al socio","semana":"Semana 2","actividades":["Recibimiento","Estandares de servicio","Especificación del servicio de acuerdo a los objetivos del socio"],"idx":7},{"n":10,"proceso":"Usuario de Avena","semana":"Semana 3","actividades":["Creación de la cuenta","Realización de plan alimenticio","Seguimiento"],"idx":8},{"n":11,"proceso":"Inbody","semana":"Semana 3","actividades":["Especificaciones al socio sobre acomodo","Limpieza","Descarga de resultados","Interpretación de resultados","Enviar resultados al socio"],"idx":9},{"n":12,"proceso":"Toma de medidas","semana":"Semana 3","actividades":["Circunferencia","Inbody","Picometria"],"idx":10},{"n":13,"proceso":"Consulta Inicial","semana":"Semana 3","actividades":["Historia clinica","Inbody","Medidas","Plan alimenicio"],"idx":11},{"n":14,"proceso":"Seguimiento al socio","semana":"Semana 4","actividades":["Repetir Inbody","Repetir Medidas","Preguntas subsecuentes","Interpretar resultados y sugerir cambios o mejoras","Cambio de plan alimenticio en caso de ser necesario"],"idx":12},{"n":15,"proceso":"Elaborar plan nutricional","semana":"Semana 4","actividades":["De acuerdo a objetivos","Historial Clinico","Antecedentes","Preguntas de habitos alimenticios","Otros habitos","Preguntar sobre uso de suplementos","Realizar plan en Avena","Seguimiento"],"idx":13},{"n":16,"proceso":"5´s","semana":"Semana 4","actividades":["Llevar materiales en mal estado a zona roja","Organizar material","Hacer limpieza rapida del área"],"idx":14}],"total_procesos":15,"total_actividades":65},"Coach de Mobility":{"departamento":"Deportes","procesos":[{"n":1,"proceso":"Conocer la oferta deportiva","semana":"Semana 1","actividades":["Presentación de instructores o colaboradores clave.","Descripción de clases y horarios","Información sobre clases especiales","Invitación a participar en las clases o audiciones","Explicación de los equipos del área","Explicación de las narrativas de los estudios","Explicación de las áreas complementarias"],"idx":0},{"n":2,"proceso":"Uso de Radios","semana":"Semana 1","actividades":["Comunicar Hora de desacanso","Comunicar si salen del área","Comunicar si hay un socio buscando a un colaborador","Apoyar a compañeros","Detectar equipo en malas condiciones","Incidencia en el área"],"idx":1},{"n":3,"proceso":"Evaluación al socio","semana":"Semana 1","actividades":["Padecimientos, lesión","Historial deportivo","Examen fisico","Ejercicios simples de movilidad"],"idx":2},{"n":4,"proceso":"Recibimiento","semana":"Semana 1","actividades":["Bienvenida del socio","Mostrar la oferta","Preguntar por objetivos"],"idx":3},{"n":5,"proceso":"Reportar equipos en mal estado","semana":"Semana 2","actividades":["Reporte de los colaboradores sobre equipo o material en mal estado","Seguimiento"],"idx":4},{"n":6,"proceso":"Propuestas de rutina, Mobility","semana":"Semana 2","actividades":["Se pasan rutinas para la semana","Se rolan las rutinas","Seguimiento"],"idx":5},{"n":7,"proceso":"Registrar aforos","semana":"Semana 2","actividades":["Agenda de coach de Mobility","Vaciado a TG"],"idx":6},{"n":8,"proceso":"Actualizar pizarrón de rutinas","semana":"Semana 3","actividades":["Actualización con las nuevas rutinas"],"idx":7},{"n":9,"proceso":"Workshops","semana":"Semana 3","actividades":["Nuevos Lineamientos","Alinear Áreas","Juntas de Deportes","Revisar procesos de servicio","Lluvia de Ideas","Cambios de equipo"],"idx":8},{"n":10,"proceso":"Recovery (NAC)","semana":"Semana 3","actividades":["Validar funcionamiento de las camas de hidromasaje"],"idx":9},{"n":11,"proceso":"Atención al socio","semana":"Semana 4","actividades":["Recibimiento","Estandares de servicio","Especificación del servicio de acuerdo a objetivos del socio"],"idx":10},{"n":12,"proceso":"Aforo del área","semana":"Semana 4","actividades":["Solicitar al líder de deportes apoyo con socios en horarios de poca afluencia"],"idx":11},{"n":13,"proceso":"5´s","semana":"Semana 4","actividades":["Llevar materiales en mal estado a zona roja","Organizar material","Hacer limpieza rapida del área"],"idx":12}],"total_procesos":13,"total_actividades":42},"Líder de Acuática":{"departamento":"Acuática","procesos":[{"n":1,"proceso":"Clases Adultos","semana":"Semana 1","actividades":["Plan de Acción Semanal","Seguimiento y cumplimiento de objetivos","5´s"],"idx":0},{"n":2,"proceso":"Clases Niños","semana":"Semana 1","actividades":["Aforo de clases","Cumplimiento de 5´s","Resolución y apoyo dudas coaches"],"idx":1},{"n":3,"proceso":"Clases Academias","semana":"Semana 1","actividades":["Plan de Acción Semanal","Seguimiento y cumplimiento de objetivos","5´s"],"idx":2},{"n":4,"proceso":"Seguimiento de toallas","semana":"Semana 1","actividades":["Stock de toallas limpias en oficina","Toallas sucias dobladas y entregadas a concierge"],"idx":3},{"n":5,"proceso":"Entrega de locker","semana":"Semana 1","actividades":["Pedido de locker","Solicitud de identificación","Resguardo de identificación","Recepción de llave y entrega de identificación"],"idx":4},{"n":6,"proceso":"Brindar informes y venta nuevos socios","semana":"Semana 1","actividades":["Recibir información de socio","Identificación de necesidades","Venta de membresias acuática","Venta de membresia familiar","Gestionar clase Prueba","Presentación del área y equipo"],"idx":5},{"n":7,"proceso":"Horario de clases","semana":"Semana 1","actividades":["Análisis de personal en clase","División de clases","Informe de horarios a equipo","Registro de incidencias"],"idx":6},{"n":8,"proceso":"Control de aforo clases","semana":"Semana 2","actividades":["Formato actualizado con asistencia clases infantes","Formato actualizado con asistencia clases adultos"],"idx":7},{"n":9,"proceso":"Venta de tienda","semana":"Semana 2","actividades":["Revisión de materiales","Compra del material","Baja en inventario","Proceso de pago no registrado","Cierre de tienda"],"idx":8},{"n":10,"proceso":"Cuadre de membresias","semana":"Semana 2","actividades":["Solicitud de cuadre de membresias","Descarga de documento de horarios","Análisis de formato","Actualización de formato horario"],"idx":9},{"n":11,"proceso":"Seguimiento pagos a membresias atrasadas","semana":"Semana 2","actividades":["Descarga de base datos","Validación de base de datos","Contacto con socios","Negociación de pago","Pago realizado"],"idx":10},{"n":12,"proceso":"Seguimiento bajas y ausencias de socios","semana":"Semana 2","actividades":["Comunicación de bajas socio","Retención de socio","Identificación de ausencia de socio","Actualización de formato horario"],"idx":11},{"n":13,"proceso":"Reporte de nómina y bonos acuática y academias","semana":"Semana 2","actividades":["Llenado de documento internos","Envío de pago de nóminas instructores","Envío de pago de nóminas academias","Envío de pago de bonos","Registro de incidencias"],"idx":12},{"n":14,"proceso":"Mantenimiento alberca","semana":"Semana 2","actividades":["Revisión de bitácora interna","Resguardo de organigrama","Proceso de Incidencia","Reporte alberca","Seguimiento limpieza alberca externo e interno"],"idx":13},{"n":15,"proceso":"Manejo de inventario locker","semana":"Semana 3","actividades":["Base de datos locker","Renta de locker y pago","Pago del locker","Entrega de locker"],"idx":14},{"n":16,"proceso":"Manejo de inventario tienda","semana":"Semana 3","actividades":["Identificación de insumos faltantes","Compra de insumos","Validación de inventario","Corte de inventario","Reposición de insumos","Mostrar los productos"],"idx":15},{"n":17,"proceso":"Compra de materiales","semana":"Semana 3","actividades":["Compra de materiales (minorista)","Compra de materiales (mayorista)","Entrega de materiales","Resguardo de materiales"],"idx":16},{"n":18,"proceso":"Seguimiento pizarra para el logro de meta","semana":"Semana 3","actividades":["Llenado de información","Llenado de aforos de clase","Análisis de información"],"idx":17},{"n":19,"proceso":"Seguimiento insumos y limpieza (sanitarios)","semana":"Semana 3","actividades":["Identificación de necesidades","Comunicación con equipo Orden y Limpieza","Validar limpieza en área"],"idx":18},{"n":20,"proceso":"Organización de eventos (academias y acuática)","semana":"Semana 3","actividades":["Preparación eventos academías","Solicitud de material","Coordinar espacio y material","Comunicación con MKT","Solicitud de pago proveedor","Solicitud de pago instructores"],"idx":19},{"n":21,"proceso":"Certificaciones: academias y acuática","semana":"Semana 3","actividades":["Certificación Instructores","Certificación Academias (Taekwondo)","Evento certificación Taekwondo","Pago a proveedor"],"idx":20},{"n":22,"proceso":"Planeación competencias acuática","semana":"Semana 4","actividades":["Identificación competencias","Invitación de socios","Entrega de documentos","Registro de asistencia","Envío de pagos nóminas"],"idx":21},{"n":23,"proceso":"Planeación de cursos intensivos de verano","semana":"Semana 4","actividades":["Planeación del curso","Validación estudio de Mercado","Plan de disponibilidad club","Planeación de actividades","Validación de aprobación del curso","Anuncio de plan al equipo","Compra de materiales","Coordinar publicidad a socios","Coordinación de espacios","Pago de nómina","Pago a proveedor"],"idx":22},{"n":24,"proceso":"Manejo de quejas","semana":"Semana 4","actividades":["Escucha de queja","Resolución de queja","Retroalimentación a equipo","Resolición de incidencia mayor"],"idx":23},{"n":25,"proceso":"Baja de colaboradores","semana":"Semana 4","actividades":["Renuncia colaborador","Comunicación de renuncia","Entrevista a nuevo colaborador"],"idx":24},{"n":26,"proceso":"Objetos perdidos","semana":"Semana 4","actividades":["Resguardo de productos","Comunicación a equipo","Entrega de objetos"],"idx":25},{"n":27,"proceso":"5´s en oficina","semana":"Semana 4","actividades":["Identificación de necesidades","Correción de necesidades","Solicitud de reparación","Validación de fases"],"idx":26}],"total_procesos":27,"total_actividades":115},"Auxiliar de Acuática":{"departamento":"Acuática","procesos":[{"n":1,"proceso":"Clases: adultos, niños, acuafitness - hidropower","semana":"Semana 1","actividades":["Resolución de dudas","Registro de asistencia clase"],"idx":0},{"n":2,"proceso":"Seguimiento de toallas","semana":"Semana 1","actividades":["Recolección de toallas limpias","Ubicación de toallas limpias en oficina","Recolección de toallas usadas","Doblado de toallas","Entregar toallas a concierge"],"idx":1},{"n":3,"proceso":"Brindar informes y venta nuevos socios","semana":"Semana 1","actividades":["Recibir información de socio","Identificación de necesidades","Venta de membresias acuática","Venta de membresia familiar","Gestionar clase Prueba","Presentación del área y equipo"],"idx":2},{"n":4,"proceso":"Control de aforo clases","semana":"Semana 1","actividades":["Revisión de clase adultos","Revisión de clase infantes","Toma de asistencia","Actualización de formato"],"idx":3},{"n":5,"proceso":"Seguimiento pagos a membresias atrasadas","semana":"Semana 1","actividades":["Descarga de base datos","Validación de base de datos","Contacto con socios","Negociación de pago","Registro de pago realizado"],"idx":4},{"n":6,"proceso":"Seguimiento bajas y ausencias de socios","semana":"Semana 2","actividades":["Comunicación de bajas socio","Identificación de ausencia de socio","Actualización de formato horario"],"idx":5},{"n":7,"proceso":"Mantenimiento alberca","semana":"Semana 2","actividades":["Revisión de bitácora interna","Resguardo de organigrama","Proceso de Incidencia","Reporte alberca","Seguimiento limpieza alberca externo e interno"],"idx":6},{"n":8,"proceso":"Entrega de locker","semana":"Semana 2","actividades":["Pedido de locker","Solicitud de identificación","Resguardo de identificación","Recepción de llave y entrega de identificación"],"idx":7},{"n":9,"proceso":"Venta de tienda","semana":"Semana 2","actividades":["Revisión de materiales","Compra del material","Baja en inventario","Proceso de pago no registrado","Cierre de tienda"],"idx":8},{"n":10,"proceso":"Manejo de inventario locker","semana":"Semana 2","actividades":["Actualización de base de datos locker","Renta de locker y pago","Pago del locker","Entrega de locker"],"idx":9},{"n":11,"proceso":"Manejo de inventario tienda","semana":"Semana 3","actividades":["Identificación de insumos faltantes","Compra de insumos","Validación de inventario","Corte de inventario","Reposición de insumos","Mostrar los productos"],"idx":10},{"n":12,"proceso":"Compra de materiales","semana":"Semana 3","actividades":["Compra de materiales (minorista)","Compra de materiales (mayorista)","Entrega de materiales","Resguardo de materiales"],"idx":11},{"n":13,"proceso":"Seguimiento pizarra para el logro de meta","semana":"Semana 3","actividades":["Llenado de información","Llenado de aforos de clase","Retroalimentación de líder"],"idx":12},{"n":14,"proceso":"Seguimiento insumos y limpieza (sanitarios)","semana":"Semana 3","actividades":["Identificación de necesidades","Comunicación con equipo Orden y Limpieza","Validar limpieza en área"],"idx":13},{"n":15,"proceso":"Organización de eventos (academias y acuática)","semana":"Semana 3","actividades":["Preparación eventos academías","Solicitud de material","Coordinar espacio y material","Comunicación con MKT","Retroalimentación de líder"],"idx":14},{"n":16,"proceso":"Planeación competencias acuática","semana":"Semana 4","actividades":["Identificación competencias","Invitación de socios","Entrega de documentos","Registro de asistencia"],"idx":15},{"n":17,"proceso":"Planeación de cursos intensivos de verano","semana":"Semana 4","actividades":["Planeación del curso","Realizar estudio de Mercado","Plan de disponibilidad club","Planeación de actividades","Anuncio de plan al equipo","Compra de materiales","Coordinar publicidad a socios","Coordinación de espacios"],"idx":16},{"n":18,"proceso":"Manejo de quejas","semana":"Semana 4","actividades":["Escucha de queja","Resolución de queja","Comunicación con líder"],"idx":17},{"n":19,"proceso":"Objetos perdidos","semana":"Semana 4","actividades":["Resguardo de productos","Comunicación a equipo","Entrega de objetos"],"idx":18},{"n":20,"proceso":"5´s en oficina","semana":"Semana 4","actividades":["Identificación de necesidades","Correción de necesidades","Solicitud de reparación","Validación de fases"],"idx":19}],"total_procesos":20,"total_actividades":86},"Instructor de Acuática":{"departamento":"Acuática","procesos":[{"n":1,"proceso":"Clases: adultos, niños, acuafitness - hidropower y equipo de natación","semana":"Semana 1","actividades":["Realizar plan de acción semanal","Inicio de clase","Calentamiento clase niños","Desarrollo de clases","Seguimiento socios en cumplimiento objetivos","Finalización de clase y 5´s"],"idx":0},{"n":2,"proceso":"Seguimiento de toallas","semana":"Semana 1","actividades":["Recolección de toallas limpias","Ubicación de toallas limpias en oficina","Recolección de toallas usadas","Doblado de toallas","Entregar toallas a concierge"],"idx":1},{"n":3,"proceso":"Brindar informes a nuevos socios","semana":"Semana 1","actividades":["Recibir información de socio","Identificación de necesidades","Presentación del área y equipo"],"idx":2},{"n":4,"proceso":"Control de aforo clases","semana":"Semana 1","actividades":["Revisión de clase adultos","Revisión de clase infantes","Toma de asistencia"],"idx":3},{"n":5,"proceso":"Seguimiento rutina y temperatura","semana":"Semana 1","actividades":["Llenado de rutina en pizarra","Toma de temperatura y anotado en pizarra"],"idx":4},{"n":6,"proceso":"Entrega de locker","semana":"Semana 2","actividades":["Pedido de locker","Solicitud de identificación","Resguardo de identificación","Recepción de llave y entrega de identificación"],"idx":5},{"n":7,"proceso":"Venta de tienda","semana":"Semana 2","actividades":["Solicitud de apertura  auxiliar o líder","Revisión de materiales"],"idx":6},{"n":8,"proceso":"Compra de materiales","semana":"Semana 2","actividades":["Identificación de necesidades","Solicitud de compra de materiales a líder"],"idx":7},{"n":9,"proceso":"Seguimiento pizarra para el logro de meta","semana":"Semana 2","actividades":["Retroalimentación de líder"],"idx":8},{"n":10,"proceso":"Seguimiento insumos y limpieza (sanitarios)","semana":"Semana 2","actividades":["Identificación de necesidades","Comunicación con equipo Orden y Limpieza"],"idx":9},{"n":11,"proceso":"Certificaciones (academias y acuática)","semana":"Semana 3","actividades":["Solicitud de certificación","Seguimiento en organización evento"],"idx":10},{"n":12,"proceso":"Organización de eventos (academias y acuática)","semana":"Semana 3","actividades":["Comunicación con líder","Planeación de actividades","Retroalimentación de líder"],"idx":11},{"n":13,"proceso":"Planeación competencias acuática","semana":"Semana 3","actividades":["Identificación competencias","Invitación de socios"],"idx":12},{"n":14,"proceso":"Planeación de cursos intensivos de verano","semana":"Semana 3","actividades":["Planeación del curso","Planeación de actividades","Solicitud de materiales"],"idx":13},{"n":15,"proceso":"Manejo de quejas","semana":"Semana 4","actividades":["Escucha de queja","Comunicación con líder"],"idx":14},{"n":16,"proceso":"Objetos perdidos","semana":"Semana 4","actividades":["Resguardo de productos","Comunicación a equipo","Entrega de objetos"],"idx":15},{"n":17,"proceso":"Cierre de área","semana":"Semana 4","actividades":["Recolección de material","Revisión de llaves locker","Recolección y entrega de toallas sucias","Tapado de alberca"],"idx":16},{"n":18,"proceso":"5´s en área de alberca","semana":"Semana 4","actividades":["Identificación de necesidades","Correción de necesidades","Solicitud de reparación","Validación de fases"],"idx":17}],"total_procesos":18,"total_actividades":53},"Maestra Kids":{"departamento":"Kids","procesos":[{"n":1,"proceso":"Recibir al niño","semana":"Semana 1","actividades":["Bienvenida al socio","Filtro por enfermedades","Filtro de limpieza","Preguntar especificaciones al socio"],"idx":0},{"n":2,"proceso":"Registro","semana":"Semana 1","actividades":["Base de datos","Entrada","Salida"],"idx":1},{"n":3,"proceso":"Registro de expedientes","semana":"Semana 1","actividades":["Paquetes","Entradas","Salidas","Registro de pagos","Horas consumidas de paquetes"],"idx":2},{"n":4,"proceso":"Entregar al niño","semana":"Semana 1","actividades":["Retroalimentación al socio","Firma de salida","Notificación de paquetes (Horas consumidas, etc.)","Dínamicas y clases especiales del mes"],"idx":3},{"n":5,"proceso":"Apertura de ludoteca","semana":"Semana 1","actividades":["Recoger llaves en recepción","Quitar alarmas (NAC)","Limpieza del área","Abrir puertas","Prender luz y aires","Prender equipos"],"idx":4},{"n":6,"proceso":"Cierre de ludoteca","semana":"Semana 1","actividades":["Apagar luces y aires","Entrega de llaves a recepción","Apagar equipos","Cerrar puerta","Armar alarmas (NAC)","Resguardo de objetos olvidados"],"idx":5},{"n":7,"proceso":"Dar de comer","semana":"Semana 2","actividades":["Especificaciones individuales","Preparación de biberon","Dar snacks","Guardar la comida de refrigeración","Calentar comida en el microondas","Comida del local (NAC)"],"idx":6},{"n":8,"proceso":"Pequeñas actividades diarias","semana":"Semana 2","actividades":["Siesta","Juego","Movilidad del niño","Dibujo","Pintura","Manualidades","Proyectos mensuales"],"idx":7},{"n":9,"proceso":"Club de tareas en la tarde (NAC)","semana":"Semana 2","actividades":["Revisar la tarea","Uso de materiales","Leer indicaciones","Acompañar al niño","Proyectos especiales"],"idx":8},{"n":10,"proceso":"Cambio de pañal","semana":"Semana 2","actividades":["Filtro a la entrada de limpieza de pañal","Cambio de pañal","Cuidar seguridad del niño y colaborador","Filtro a la salida de limpieza de pañal"],"idx":9},{"n":11,"proceso":"Casos especiales","semana":"Semana 2","actividades":["Acompañar a los niños al baño/limpieza"],"idx":10},{"n":12,"proceso":"Higiene y Cuidado del Niño","semana":"Semana 3","actividades":["Limpieza de cara y manos"],"idx":11},{"n":13,"proceso":"Planeación de un actividad grande","semana":"Semana 3","actividades":["Lluvia de ideas","Planeación en conjunto","Consulta con líder de Turno","Ver publicidad  con Marketing de ser necesario","Presupuesto y costo"],"idx":12},{"n":14,"proceso":"Limpieza de cocina: micro / refri  / Locker","semana":"Semana 3","actividades":["Rol de limpieza entre colaboradores","Limpieza general","Coordinar tintoreria con Orden y Limpieza"],"idx":13},{"n":15,"proceso":"Sistema de confianza","semana":"Semana 3","actividades":["Recordar sobre paquetes vencidos al socio","Pago en caja","Entrega de recibo al socio"],"idx":14},{"n":16,"proceso":"5´s","semana":"Semana 3","actividades":["Organizar material","Limpieza","Repotar material en mal estado"],"idx":15},{"n":17,"proceso":"Empoderamientos","semana":"Semana 4","actividades":["Servicio de excelencia","Toma de desiciones para mejora del área"],"idx":16},{"n":18,"proceso":"Pedido de papeleria","semana":"Semana 4","actividades":["Lista de cosas faltantes","Pedido a compras (Líder de turno)"],"idx":17},{"n":19,"proceso":"Televisión","semana":"Semana 4","actividades":["Apagar/prender televisores","Programas apropiados para niños"],"idx":18},{"n":20,"proceso":"Gestionar Cobro de Paquetes","semana":"Semana 4","actividades":["Revisar estado del paquete/Pago por horas","Stop en Poliwin","Cobro en caja"],"idx":19},{"n":21,"proceso":"Resolución de Quejas y Sugerencias","semana":"Semana 4","actividades":["Resolver problemas en área","Si hay recurrencias el líder de turno habla con el socio","Resolución"],"idx":20}],"total_procesos":21,"total_actividades":78},"Aux. Kids":{"departamento":"Kids","procesos":[{"n":1,"proceso":"Recibir al niño","semana":"Semana 1","actividades":["Bienvenida al socio","Filtro por enfermedades","Filtro de limpieza","Preguntar especificaciones al socio"],"idx":0},{"n":2,"proceso":"Registro","semana":"Semana 1","actividades":["Base de datos","Entrada","Salida"],"idx":1},{"n":3,"proceso":"Registro de expedientes","semana":"Semana 1","actividades":["Paquetes","Entradas","Salidas","Registro de pagos","Horas consumidas de paquetes"],"idx":2},{"n":4,"proceso":"Entregar al niño","semana":"Semana 1","actividades":["Retroalimentación al socio","Firma de salida","Notificación de paquetes (Horas consumidas, etc.)","Dínamicas y clases especiales del mes"],"idx":3},{"n":5,"proceso":"Apertura de ludoteca","semana":"Semana 1","actividades":["Recoger llaves en recepción","Quitar alarmas (NAC)","Limpieza del área","Abrir puertas","Prender luz y aires","Prender equipos"],"idx":4},{"n":6,"proceso":"Cierre de ludoteca","semana":"Semana 1","actividades":["Apagar luces y aires","Entrega de llaves a recepción","Apagar equipos","Cerrar puerta","Armar alarmas (NAC)","Resguardo de objetos olvidados"],"idx":5},{"n":7,"proceso":"Dar de comer","semana":"Semana 2","actividades":["Especificaciones individuales","Preparación de biberon","Dar snacks","Guardar la comida de refrigeración","Calentar comida en el microondas","Comida del local (NAC)"],"idx":6},{"n":8,"proceso":"Pequeñas actividades diarias","semana":"Semana 2","actividades":["Siesta","Juego","Movilidad del niño","Dibujo","Pintura","Manualidades","Proyectos mensuales"],"idx":7},{"n":9,"proceso":"Club de tareas en la tarde (NAC)","semana":"Semana 2","actividades":["Revisar la tarea","Uso de materiales","Leer indicaciones","Acompañar al niño","Proyectos especiales"],"idx":8},{"n":10,"proceso":"Cambio de pañal","semana":"Semana 2","actividades":["Filtro a la entrada de limpieza de pañal","Cambio de pañal","Cuidar seguridad del niño y colaborador","Filtro a la salida de limpieza de pañal"],"idx":9},{"n":11,"proceso":"Casos especiales","semana":"Semana 2","actividades":["Acompañar a los niños al baño/limpieza"],"idx":10},{"n":12,"proceso":"Higiene y Cuidado del Niño","semana":"Semana 3","actividades":["Limpieza de cara y manos"],"idx":11},{"n":13,"proceso":"Planeación de un actividad grande","semana":"Semana 3","actividades":["Lluvia de ideas","Planeación en conjunto","Consulta con líder de Turno","Ver publicidad  con Marketing de ser necesario","Presupuesto y costo"],"idx":12},{"n":14,"proceso":"Limpieza de cocina: micro / refri  / Locker","semana":"Semana 3","actividades":["Rol de limpieza entre colaboradores","Limpieza general","Coordinar tintoreria con Orden y Limpieza"],"idx":13},{"n":15,"proceso":"Sistema de confianza","semana":"Semana 3","actividades":["Recordar sobre paquetes vencidos al socio","Pago en caja","Entrega de recibo al socio"],"idx":14},{"n":16,"proceso":"5´s","semana":"Semana 3","actividades":["Organizar material","Limpieza","Repotar material en mal estado"],"idx":15},{"n":17,"proceso":"Empoderamientos","semana":"Semana 4","actividades":["Servicio de excelencia","Toma de desiciones para mejora del área"],"idx":16},{"n":18,"proceso":"Pedido de papeleria","semana":"Semana 4","actividades":["Lista de cosas faltantes","Pedido a compras (Líder de turno)"],"idx":17},{"n":19,"proceso":"Televisión","semana":"Semana 4","actividades":["Apagar/prender televisores","Programas apropiados para niños"],"idx":18},{"n":20,"proceso":"Gestionar Cobro de Paquetes","semana":"Semana 4","actividades":["Revisar estado del paquete/Pago por horas","Stop en Poliwin","Cobro en caja"],"idx":19},{"n":21,"proceso":"Resolución de Quejas y Sugerencias","semana":"Semana 4","actividades":["Resolver problemas en área","Si hay recurrencias el líder de turno habla con el socio","Resolución"],"idx":20}],"total_procesos":21,"total_actividades":78},"Líder de Mantenimiento":{"departamento":"Mantenimiento","procesos":[{"n":1,"proceso":"Aires acondicionados","semana":"Semana 1","actividades":["Limpieza interna","Detección de falla","Contratación de proveedor","Solución de falla","Envío de evidencia","Pago de servicio"],"idx":0},{"n":2,"proceso":"Transformador","semana":"Semana 1","actividades":["Programación con proveedor","Apagado de electricidad","Toma de muestra","Envío de evidencia","Pagado de servicio","Resguardado de bitácora"],"idx":1},{"n":3,"proceso":"Tableros electrícos","semana":"Semana 1","actividades":["Programación con proveedor","Apagado de electricidad","Reparación","Entrega de bitácora","Pagado de servicio","Resguardado de bitácora"],"idx":2},{"n":4,"proceso":"Equipos de fuerza","semana":"Semana 2","actividades":["Lubricación de máquina","Detección de incidencias","Comunicación con incidencias proveedor","Pago del servicio y comunicación con Sucursal"],"idx":3},{"n":5,"proceso":"Equipos de cardio","semana":"Semana 2","actividades":["Equipo funcionando correctamente","Entrega de bitácora","Recepción de evidencia","Pago de servicio"],"idx":4},{"n":6,"proceso":"Duelas","semana":"Semana 3","actividades":["Programación proveedor","Revisión de evidencia","Pago generado"],"idx":5},{"n":7,"proceso":"Solicitud de compra","semana":"Semana 3","actividades":["Comunicación con coordinador","Realizar cotizaciones","Comunicar compra de material","Aprobación de compra de insumos"],"idx":6},{"n":8,"proceso":"Hidrantes y Extintores","semana":"Semana 4","actividades":["Extintores e hidrantes llenos y acomodados correctamente","Formato actualizado"],"idx":7},{"n":9,"proceso":"Calendario de mantenimiento anual con los requisitos interno o externos","semana":"Semana 4","actividades":["Llenado de actividades","Actualización de actividades","Coordinación de actividades"],"idx":8}],"total_procesos":9,"total_actividades":38},"Coordinador de Mantenimiento":{"departamento":"Mantenimiento","procesos":[{"n":1,"proceso":"Apertura de Club","semana":"Semana 1","actividades":["Apertura de club","Levantamiento de cortinas recepción","Encedido de luces, aparatos cardio, aires acondicionados","Encedido de máquinas vapores","Encargado de recepción socio - Estacionamiento"],"idx":0},{"n":1,"proceso":"Inspección diaria","semana":"Semana 1","actividades":["Incidencias reportadas","Revisión de evidencias"],"idx":1},{"n":2,"proceso":"Mantenimiento de calentador de servicios generales","semana":"Semana 1","actividades":["Funcionamiento correcto de aparato"],"idx":2},{"n":6,"proceso":"Equipos de fuerza","semana":"Semana 1","actividades":["Lubricación de máquina","Detección de incidencias","Comunicación con incidencias proveedor","Pago del servicio y comunicación con Sucursal"],"idx":3},{"n":7,"proceso":"Equipos de cardio","semana":"Semana 1","actividades":["Equipo funcionando correctamente","Entrega de bitácora","Recepción de evidencia","Pago de servicio"],"idx":4},{"n":8,"proceso":"Atención a Ticket","semana":"Semana 2","actividades":["Revisión servidor o grupos","Asignación de prioridades a equipo","Envío de evidencia","Cierre de ticket por servidor","Cierre de ticket por What´sApp"],"idx":5},{"n":9,"proceso":"Duelas","semana":"Semana 2","actividades":["Programación con proveedor","Proceso de limpieza","Envío de evidencia","Pago de servicio"],"idx":6},{"n":10,"proceso":"Drenajes","semana":"Semana 2","actividades":["Limpieza de coladeras","Circulación de agua","Cierre de coladera"],"idx":7},{"n":11,"proceso":"Pintura de Muros","semana":"Semana 2","actividades":["Pintura","Check list completo","Envío de evidencia"],"idx":8},{"n":12,"proceso":"Tablaroca","semana":"Semana 2","actividades":["Corrección de necesidades","Limpieza","Envío de evidencia"],"idx":9},{"n":13,"proceso":"Impermeabilización","semana":"Semana 3","actividades":["Compra de insumos","Impermeabiliza"],"idx":10},{"n":14,"proceso":"Herramientas y consumibles / Solicitud de compra","semana":"Semana 3","actividades":["Identificar material faltante","Prueba de combustibles","Comunicar compra de material"],"idx":11},{"n":15,"proceso":"Hidrantes y Extintores","semana":"Semana 3","actividades":["Revisión de extintores","Llenado de formato","Recarga de extintores","Resguardo de formato","Revisión de hidrantes","Revisión de puertas y herramientas"],"idx":12},{"n":16,"proceso":"Recepción de proveedores","semana":"Semana 3","actividades":["Recepción de materiales","Validación de material"],"idx":13},{"n":17,"proceso":"Registro de CFE / Agua  / GAS","semana":"Semana 3","actividades":["Solicitud de registro información","Vaciado de información","Envío de información a compras","Surtido de gas y agua"],"idx":14},{"n":18,"proceso":"Calendario de mantenimiento anual con los requisitos interno o externos","semana":"Semana 4","actividades":["Revisión de calendario","Actualización de actividades","Coordinación de actividades"],"idx":15},{"n":19,"proceso":"Check list","semana":"Semana 4","actividades":["Envío de check list a equipo","Revisión de check list"],"idx":16},{"n":19,"proceso":"Revisión de escaleras y jardines","semana":"Semana 4","actividades":["Validación","Contacto con proveedor"],"idx":17},{"n":20,"proceso":"Cierre de club","semana":"Semana 4","actividades":["Apagado de luces, máquinas y aires acondicionados","Solución de incidencia"],"idx":18}],"total_procesos":19,"total_actividades":60},"Técnico de Mantenimiento":{"departamento":"Mantenimiento","procesos":[{"n":1,"proceso":"Apertura de Club","semana":"Semana 1","actividades":["Apertura de puertas","Levantamiento de cortinas recepción","Encedido de luces, aparatos cardio, aires acondicionados","Encedido de máquinas vapores","Encargado de recepción socio - Estacionamiento"],"idx":0},{"n":2,"proceso":"Inspección diaria","semana":"Semana 1","actividades":["Revisión general y específica por área","Resolución de incidencias","Comunicación con líder","Envío de evidencia"],"idx":1},{"n":3,"proceso":"Mantenimiento: Calentador de servicios generales","semana":"Semana 1","actividades":["Apagado de calentador","Limpieza del calentador","Revisión electrónica","Encendido correcto de máquina"],"idx":2},{"n":4,"proceso":"Generadores de vapor","semana":"Semana 1","actividades":["Apagado de maquina","Inspección de varillas","Drenado de tanque","Revisión eléctrico","Envío de evidencia líder"],"idx":3},{"n":5,"proceso":"Calentadores de alberca","semana":"Semana 1","actividades":["Apagado de máquina","Revisión electrónica","Detección de falla y comunicación líder","Envío de evidencia líder"],"idx":4},{"n":6,"proceso":"Equipos de fuerza","semana":"Semana 1","actividades":["Inspección","Lubricación de máquina","Detección de incidencias y comunicación líder","Envío de evidencia líder"],"idx":5},{"n":7,"proceso":"Atención a Ticket","semana":"Semana 1","actividades":["Comunicación con líder","Recepción de incidencia reportada","Envío de evidencia"],"idx":6},{"n":8,"proceso":"Drenajes","semana":"Semana 2","actividades":["Limpieza de coladeras","Circulación de agua","Cierre de coladera","Envío de evidencia"],"idx":7},{"n":9,"proceso":"Revisión de baños","semana":"Semana 2","actividades":["Revisión de regaderas, cebolla, monomando","Revisión de puerta y película","Cambio y reparación de puerta","Revisión de WC","Revisión de lavabo","Envío de evidencia"],"idx":8},{"n":10,"proceso":"Azotea: Aire lavado","semana":"Semana 2","actividades":["Retirar basura","Envío de evidencia"],"idx":9},{"n":11,"proceso":"Pintura de Muros","semana":"Semana 2","actividades":["Revisión General","Pintura de área","Revisión de detalles a partir de check list","Envío de evidencia"],"idx":10},{"n":12,"proceso":"Tablaroca","semana":"Semana 2","actividades":["Revisión General","Corrección de necesidades","Limpieza de área","Envío de evidencia"],"idx":11},{"n":13,"proceso":"Cambio y reparación de Chapas de locker","semana":"Semana 2","actividades":["Recepción de solicitud de cambio de chapa (perdida o renta)","Cambio de chapa","Entrega a equipo asignado","Envío de evidencia"],"idx":12},{"n":14,"proceso":"Cambio y reparación de cortinas","semana":"Semana 2","actividades":["Revisión general","Cambio de engranes","Envío de evidencia"],"idx":13},{"n":15,"proceso":"Agua de la alberca","semana":"Semana 3","actividades":["Toma de parámetro","Limpieza de filtros","Renovación de agua","Llenado de bitácora","Resolución de incidencias"],"idx":14},{"n":16,"proceso":"Impermeabilización","semana":"Semana 3","actividades":["Identificación de necesidades","Impermeabiliza","Envío de evidencia"],"idx":15},{"n":17,"proceso":"Cambio de películas en puertas de cristal","semana":"Semana 3","actividades":["Identificación de necesidades","Cambio de películas","Retiración de burbujas","Envío de evidencia"],"idx":16},{"n":18,"proceso":"5´s","semana":"Semana 3","actividades":["Cumplimiento de fases","Validación"],"idx":17},{"n":19,"proceso":"Herramientas y consumibles / Solicitud de compra","semana":"Semana 3","actividades":["Identificar material faltante","Prueba de combustibles","Comunicar compra de material a líder"],"idx":18},{"n":20,"proceso":"Entrega de Turno","semana":"Semana 3","actividades":["Comunicación de actividades a compañero","Finalización de actividades","Envío de evidencia"],"idx":19},{"n":21,"proceso":"Hidrantes y Extintores","semana":"Semana 3","actividades":["Revisión de extintores","Llenado de formato","Recarga de extintores","Resguardo de formato","Revisión de hidrantes","Revisión de puertas y herramientas"],"idx":20},{"n":22,"proceso":"Recepción de proveedores","semana":"Semana 4","actividades":["Recepción de materiales","Validación de material"],"idx":21},{"n":23,"proceso":"Registro de CFE / Agua  / GAS","semana":"Semana 4","actividades":["Registro de insumos","Entrega a líder"],"idx":22},{"n":24,"proceso":"Calendario de mantenimiento anual con los requisitos interno o externos","semana":"Semana 4","actividades":["Comunicación de actividades programadas","Ejecución de actividades","Envío de evidencia"],"idx":23},{"n":25,"proceso":"Check list","semana":"Semana 4","actividades":["Recepción de check list","Llenado de formato con las revisiones","Ejecución de necesidades","Envío de evidencia"],"idx":24},{"n":26,"proceso":"Revisión de escaleras y jardines","semana":"Semana 4","actividades":["Pintado de macetas y jardineras","Envío de evidencia"],"idx":25},{"n":27,"proceso":"Cierre de club","semana":"Semana 4","actividades":["Apagado de luces, máquinas y aires","Cierre de cortinas","Cierre de puertas"],"idx":26}],"total_procesos":27,"total_actividades":98},"Capitán de Limpieza":{"departamento":"Orden y Limpieza","procesos":[{"n":1,"proceso":"Check list de áreas al inicio de turno","semana":"Semana 1","actividades":["Se comparte resultados","Seguimiento a bitácora de trabajo"],"idx":0},{"n":2,"proceso":"Entrega de insumos","semana":"Semana 1","actividades":["Registro de material","Cerrado de área"],"idx":1},{"n":3,"proceso":"Trabajos a detalle programados","semana":"Semana 1","actividades":["Organización de actividades","División de actividades","Validación de evidencia"],"idx":2},{"n":4,"proceso":"Limpieza de Tapetes","semana":"Semana 1","actividades":["Validación de evidencia","Programación de limpieza profunda tapetes mobility, naranjas y acuática (NAC)"],"idx":3},{"n":5,"proceso":"Limpieza Vestidores","semana":"Semana 2","actividades":["Validación de:","Limpieza de paredes","Piso","Cebolla y jaboneras","Espejos y vidrios","Puertas y piso exterior","Agenda de limpieza a profundidad"],"idx":4},{"n":6,"proceso":"Surtido de Garrafones","semana":"Semana 2","actividades":["Se realiza el pedido","Recepción y conteo"],"idx":5},{"n":7,"proceso":"Abastecimiento de Insumos de servicio premium vestidores (Crema, gel, cotonetes, mentas,  fijador, almohaditas desmaquillantes)","semana":"Semana 2","actividades":["Recepción de check list de insumos faltantes","Registro de material en bitácora","Validación de productos vacíos con bitácora","Relleno de suministros en bodega"],"idx":6},{"n":8,"proceso":"Abastecimiento de Toallas","semana":"Semana 2","actividades":["Pedido de toallas","Recepción de toallas","Aclaración de dudas","Entrega de toallas","Registro de paquetes sucios","Comunicación de control","Validación de entrega de toalla"],"idx":7},{"n":9,"proceso":"Abastecimiento de Insumos de limpieza:Papel de manos, Papel de baño, Jabón manos, Shampoo, Acondicionador, Jabon de cuerpo","semana":"Semana 3","actividades":["Pedido de insumos","Surtir bodega","Registro control"],"idx":8},{"n":10,"proceso":"Abastecimiento de servicio premium: Café, sobres de té, splenda, mentas, vitroleras con agua y clorofila","semana":"Semana 3","actividades":["Colocación de vitroleras","Colocación de Café","Recarga de suministros","Relleno de material","Validación de limpieza final turno"],"idx":9},{"n":11,"proceso":"Limpieza y cuidado de plantas y macetas","semana":"Semana 3","actividades":["Validación de limpieza de macetas","Validación de cuidado de planta","Validación de riego","Contacto con proveedor","Validación de cortado de cesped y plantas","Detección de cuidados externos","Pedido de materiales","Entrega y utilización de materiales"],"idx":10},{"n":12,"proceso":"Pulido de piso","semana":"Semana 4","actividades":["Coordinación de equipo","Pulido de piso","Acomodo de maquinas","Trapeado de piso","Validación de actividad"],"idx":11},{"n":13,"proceso":"Limpieza de maquinas de fuerza","semana":"Semana 4","actividades":["Validación de limpieza","Programación de limpieza a dellate","Validación de limpieza a detalle"],"idx":12},{"n":14,"proceso":"5´s Bodega","semana":"Semana 4","actividades":["Auditorias de validación","Retroalimentación a equipo","Validación de mejora"],"idx":13}],"total_procesos":14,"total_actividades":56},"Concierge de Vestidores":{"departamento":"Orden y Limpieza","procesos":[{"n":1,"proceso":"Entrega de Toalla y Locker","semana":"Semana 1","actividades":["Acercamiento con el socio","Solicita una identificación o pertencia para la entrega de insumos","Resguardo de identificación y pertencia","Entrega de pase de una toalla","Entrega de toalla y locker"],"idx":0},{"n":2,"proceso":"Entrega de insumos","semana":"Semana 1","actividades":["Registro de material","Cerrado de área"],"idx":1},{"n":5,"proceso":"Limpieza Vestidor","semana":"Semana 1","actividades":["Validación de limpieza general","Validación de limpieza a profundidad"],"idx":2},{"n":6,"proceso":"Surtido de Garrafones","semana":"Semana 2","actividades":["Llenado de garrafón","Repuesto completo"],"idx":3},{"n":7,"proceso":"Abastecimiento de Insumos de servicio premium vestidores (Crema, gel, cotonetes, mentas,  fijador, almohaditas desmaquillantes)","semana":"Semana 2","actividades":["Recepción de check list de insumos faltantes","Comunicar los insumos faltantes","Abastecer bodega interna","Registro de material en bitácora","Deja productos vacíos","Comunicación de productos tomados","Validar el relleno de suministros"],"idx":4},{"n":8,"proceso":"Abastecimiento de Toallas","semana":"Semana 2","actividades":["Recepción de toallas","Entrega de toallas","Registro de paquetes sucios","Comunicación de control","Separación de toallas","Cortado de toallas"],"idx":5},{"n":9,"proceso":"Abastecimiento de Insumos de limpieza:Papel de manos, Papel de baño, Jabón manos, Shampoo, Acondicionador, Jabon de cuerpo","semana":"Semana 3","actividades":["Validación de suministros completos"],"idx":6},{"n":11,"proceso":"Limpieza y cuidado de plantas y macetas","semana":"Semana 3","actividades":["Riego","Cuidado de planta"],"idx":7},{"n":12,"proceso":"Limpieza de locker","semana":"Semana 3","actividades":["Validación de limpieza general","Validación de limpieza específico"],"idx":8},{"n":13,"proceso":"Pulido de piso","semana":"Semana 4","actividades":["Selección de material","Pulido de piso","Acomodo de maquinas/ material","Trapeado de piso"],"idx":9},{"n":15,"proceso":"5´s Bodega","semana":"Semana 4","actividades":["Auditorias de validación","Retroalimentación a equipo","Validación de mejora"],"idx":10}],"total_procesos":11,"total_actividades":36},"Técnico Vestidores":{"departamento":"Orden y Limpieza","procesos":[{"n":1,"proceso":"Entrega de insumos","semana":"Semana 1","actividades":["Identificación de materiales faltantes","Toma de materiales","Registro de material"],"idx":0},{"n":2,"proceso":"Limpieza de Vestidores","semana":"Semana 1","actividades":["Se toman los recursos necesarios","Limpieza de paredes","Limpieza de piso","Limpieza de cebolla y jaboneras","Limpieza de puertas y piso exterior","Limpieza a profundidad"],"idx":1},{"n":5,"proceso":"Abastecimiento de Insumos de servicio premium vestidores: Crema, gel, cotonetes, mentas,  fijador, almohaditas desmaquillantes","semana":"Semana 1","actividades":["Se abastece loker interor","Se anota en bitácora de fuerza los materiales tomados","Se deja los insumos utilizados","Se comunica a líder insumos tomados","Se rellena los suministros"],"idx":2},{"n":6,"proceso":"Abasticimiento de toallas","semana":"Semana 1","actividades":["Recepción de toallas","Sumunistro de toallas concierge"],"idx":3},{"n":7,"proceso":"Limpieza de vidrios y espejos","semana":"Semana 1","actividades":["Selección de materiales","Limpieza de vidrios y cristales","Pulir espejos con paño y limpiador"],"idx":4},{"n":8,"proceso":"Limpieza de Sanitarios","semana":"Semana 2","actividades":["Selección de recursos","Limpieza de excusado","Limpieza de puerta","Limpieza piso","Reposición de papel","Retirado de papel sanitario","Lavado a detalle"],"idx":5},{"n":9,"proceso":"Abastecimiento de Insumos de limpieza:Papel de manos, Papel de baño, Jabón manos, Shampoo, Acondicionador, Jabon de cuerpo","semana":"Semana 2","actividades":["Surtido de insumos a bodega fuerza","Relleno de suministros"],"idx":6},{"n":10,"proceso":"Abastecimiento de servicio premium: Café, sobres de té, splenda, mentas, vitroleras con agua y clorofila","semana":"Semana 2","actividades":["Recarga de suministros","Relleno de material en cajón interno"],"idx":7},{"n":11,"proceso":"Limpieza y cuidado de plantas y macetas","semana":"Semana 2","actividades":["Riego","Cuidado de planta"],"idx":8},{"n":12,"proceso":"Limpieza de locker","semana":"Semana 2","actividades":["Selección de recursos","Limpieza exterior","Limpieza interior","Limpieza específico y superior"],"idx":9},{"n":13,"proceso":"Limpieza de ventilador","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de helices, luminaria y eje-motor"],"idx":10},{"n":14,"proceso":"Limpieza de varandal y escaleras","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de pasamano, varandal y escaleras","Limpieza a profundidad"],"idx":11},{"n":15,"proceso":"Limpieza de muros de madera","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de muro"],"idx":12},{"n":16,"proceso":"Lavado de marcos de ventanas y puertas","semana":"Semana 3","actividades":["Selección de materiales","Limpieza de áreas","Limpieza de contactos de luz","Limpieza de percianas","Limpieza de zonas altas"],"idx":13},{"n":17,"proceso":"Lavado de despachadores de agua","semana":"Semana 4","actividades":["Retirado de garrafones","Limpieza de despachadores"],"idx":14},{"n":18,"proceso":"Limpieza de aires acondicionado","semana":"Semana 4","actividades":["Selección de recursos","Limpieza de aire acondicionado externa"],"idx":15},{"n":19,"proceso":"Pulido de piso","semana":"Semana 4","actividades":["Selección de material","Pulido de piso","Acomodo de maquinas/ material","Trapeado de piso"],"idx":16},{"n":20,"proceso":"5´s Bodega","semana":"Semana 4","actividades":["Identificación de necesidades","Completar los materiales","Acomodo de materiales"],"idx":17}],"total_procesos":18,"total_actividades":59},"Técnico Clases":{"departamento":"Deportes","procesos":[{"n":1,"proceso":"Entrega de insumos","semana":"Semana 1","actividades":["Identificación de materiales faltantes","Toma de materiales","Registro de material"],"idx":0},{"n":2,"proceso":"Trabajos programados","semana":"Semana 1","actividades":["Comunicación con líder","Limpieza de área comunicada","Envío de evidencia"],"idx":1},{"n":5,"proceso":"Limpieza de tapetes","semana":"Semana 1","actividades":["Selección de materiales","Limpieza de tapetes servicio socio","Limpieza de tapetes de piso","Envío de evidencia"],"idx":2},{"n":6,"proceso":"Limpieza de Salones","semana":"Semana 1","actividades":["Identificar horario","Selección de recursos","Limpieza piso","Limpieza de tapetes","Limpieza de aparatos","Limpieza profunda cierre de turno","Sumnistro de material en clase"],"idx":3},{"n":7,"proceso":"Surtido de garrafones y limpieza de despachadores","semana":"Semana 1","actividades":["Recepción de garrafones","Entrega de garrafones en cada espacio","Bajado de garrafones vacíos","Selección de despachadores","Limpieza de despachadores"],"idx":4},{"n":8,"proceso":"Limpieza de Vidrios y Espejos","semana":"Semana 1","actividades":["Selección de materiales","Limpieza de vidrios y cristales","Pulir espejos con paño y limpiador"],"idx":5},{"n":10,"proceso":"Abastecimiento de servicio premium: Café, sobres de té, splenda, mentas, vitroleras con agua y clorofila","semana":"Semana 2","actividades":["Recarga de suministros","Relleno de material en cajón interno"],"idx":6},{"n":11,"proceso":"Limpieza y cuidado de plantas y macetas","semana":"Semana 2","actividades":["Selección de recursos","Limpieza maceta","Cuidado de planta","Riego de planta","Detección de cuidados externos"],"idx":7},{"n":12,"proceso":"Pulido de piso","semana":"Semana 2","actividades":["Selección de material","Pulido de piso","Acomodo de maquinas/ material","Trapeado de piso"],"idx":8},{"n":13,"proceso":"Limpieza de bicicletas","semana":"Semana 2","actividades":["Selección de materiales","Limpieza general de aparatos en cada clase","Limpieza profundo cierre de turno"],"idx":9},{"n":14,"proceso":"Limpieza de herramientas clase","semana":"Semana 2","actividades":["Selección de material","Limpieza de mancuernas, bancos","Limpieza de pelotas, mancuernas y bosu"],"idx":10},{"n":15,"proceso":"Limpieza de bodegas de salones","semana":"Semana 2","actividades":["Selección de material","Limpieza de bodega","Suministro de materiales"],"idx":11},{"n":16,"proceso":"Limpieza de ventilador","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de helices, luminaria y eje-motor"],"idx":12},{"n":17,"proceso":"Limpieza de varandal y escaleras","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de pasamano, varandal y escaleras","Limpieza a profundidad"],"idx":13},{"n":18,"proceso":"Limpieza de muros de madera","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de muro"],"idx":14},{"n":19,"proceso":"Lavado de marcos de ventanas y puertas","semana":"Semana 3","actividades":["Selección de materiales","Limpieza de áreas","Limpieza de contactos de luz","Limpieza de percianas","Limpieza de zonas altas"],"idx":15},{"n":20,"proceso":"Limpieza de letreros y señaletica: extintores, señalética, muro de avisos","semana":"Semana 3","actividades":["Selección de material","Limpieza del letreros internos","Limpieza de letreros externos"],"idx":16},{"n":21,"proceso":"Limpieza de cámaras","semana":"Semana 4","actividades":["Selección de recursos","Preparación de la franela","Limpieza de las cámaras"],"idx":17},{"n":22,"proceso":"Limpieza de aires acondicionado","semana":"Semana 4","actividades":["Selección de recursos","Limpieza de aire acondicionado externa"],"idx":18},{"n":23,"proceso":"Limpieza área colaboradores y oficinas","semana":"Semana 4","actividades":["Selección de recursos","Limpieza del área de cocina","Limpieza de refrigerador","Limpieza de pasillo","Limpieza de escritorios y sillas","Limpieza de piso","Tirado de basura"],"idx":19},{"n":24,"proceso":"Recolección de basura lavado del cuarto de basura","semana":"Semana 4","actividades":["Vaciado de basura a contenedor general","Entrega de basura caminón","Lavado de contenedor y tambo"],"idx":20},{"n":25,"proceso":"5´s Bodega","semana":"Semana 4","actividades":["Identificación de necesidades","Completar los materiales","Acomodo de materiales"],"idx":21}],"total_procesos":22,"total_actividades":78},"Técnico Fuerza y Cardio":{"departamento":"Deportes","procesos":[{"n":1,"proceso":"Entrega de insumos","semana":"Semana 1","actividades":["Identificación de materiales faltantes","Toma de materiales","Registro de material"],"idx":0},{"n":2,"proceso":"Trabajos programados","semana":"Semana 1","actividades":["Comunicación con líder","Limpieza de área comunicada","Envío de evidencia"],"idx":1},{"n":3,"proceso":"Limpieza de tapetes","semana":"Semana 1","actividades":["Selección de materiales","Limpieza de tapetes servicio socio","Limpieza de tapetes de piso","Envío de evidencia"],"idx":2},{"n":4,"proceso":"Limpieza de Salones","semana":"Semana 1","actividades":["Identificar horario","Selección de recursos","Limpieza piso","Limpieza de tapetes","Limpieza de aparatos","Limpieza profunda cierre de turno","Sumnistro de material en clase"],"idx":3},{"n":5,"proceso":"Surtido de garrafones y limpieza de despachadores","semana":"Semana 1","actividades":["Recepción de garrafones","Entrega de garrafones en cada espacio","Bajado de garrafones vacíos","Selección de despachadores","Limpieza de despachadores"],"idx":4},{"n":6,"proceso":"Limpieza de Vidrios y Espejos","semana":"Semana 1","actividades":["Selección de materiales","Limpieza de vidrios y cristales","Pulir espejos con paño y limpiador"],"idx":5},{"n":7,"proceso":"Abastecimiento de servicio premium: Café, sobres de té, splenda, mentas, vitroleras con agua y clorofila","semana":"Semana 2","actividades":["Recarga de suministros","Relleno de material en cajón interno"],"idx":6},{"n":8,"proceso":"Limpieza y cuidado de plantas y macetas","semana":"Semana 2","actividades":["Selección de recursos","Limpieza maceta","Cuidado de planta","Riego de planta","Detección de cuidados externos"],"idx":7},{"n":9,"proceso":"Pulido de piso","semana":"Semana 2","actividades":["Selección de material","Pulido de piso","Acomodo de maquinas/ material","Trapeado de piso"],"idx":8},{"n":10,"proceso":"Limpieza de máquinas","semana":"Semana 2","actividades":["Selección de materiales","Limpieza de zonas críticas fuerza y bicicletas","Limpieza a detalle"],"idx":9},{"n":11,"proceso":"Limpieza de materiales ejercicio","semana":"Semana 2","actividades":["Selección de material","Limpieza de mancuernas, bancos","Limpieza de pelotas, mancuernas y bosu"],"idx":10},{"n":12,"proceso":"Limpieza de ventilador","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de helices, luminaria y eje-motor"],"idx":11},{"n":13,"proceso":"Limpieza de varandal y escaleras","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de pasamano, varandal y escaleras","Limpieza a profundidad"],"idx":12},{"n":14,"proceso":"Limpieza de muros de madera","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de muro"],"idx":13},{"n":15,"proceso":"Lavado de marcos de ventanas y puertas","semana":"Semana 3","actividades":["Selección de materiales","Limpieza de áreas","Limpieza de contactos de luz","Limpieza de percianas","Limpieza de zonas altas"],"idx":14},{"n":16,"proceso":"Limpieza de letreros y señaletica: extintores, señalética, muro de avisos","semana":"Semana 3","actividades":["Selección de material","Limpieza del letreros internos","Limpieza de letreros externos"],"idx":15},{"n":17,"proceso":"Limpieza de cámaras","semana":"Semana 4","actividades":["Selección de recursos","Preparación de la franela","Limpieza de las cámaras"],"idx":16},{"n":18,"proceso":"Limpieza de aires acondicionado","semana":"Semana 4","actividades":["Selección de recursos","Limpieza de aire acondicionado externa"],"idx":17},{"n":19,"proceso":"Limpieza área colaboradores y oficinas","semana":"Semana 4","actividades":["Selección de recursos","Limpieza del área de cocina","Limpieza de refrigerador","Limpieza de pasillo","Limpieza de escritorios y sillas","Limpieza de piso","Tirado de basura"],"idx":18},{"n":20,"proceso":"Recolección de basura lavado del cuarto de basura","semana":"Semana 4","actividades":["Vaciado de basura a contenedor general","Entrega de basura caminón","Lavado de contenedor y tambo"],"idx":19},{"n":21,"proceso":"5´s Bodega","semana":"Semana 4","actividades":["Identificación de necesidades","Completar los materiales","Acomodo de materiales"],"idx":20}],"total_procesos":21,"total_actividades":75},"Técnico Acuática":{"departamento":"Acuática","procesos":[{"n":1,"proceso":"Entrega de insumos","semana":"Semana 1","actividades":["Identificación de materiales faltantes","Toma de materiales","Registro de material"],"idx":0},{"n":2,"proceso":"Limpieza de Vestidores","semana":"Semana 1","actividades":["Se toman los recursos necesarios","Limpieza de paredes","Limpieza de piso","Limpieza de cebolla y jaboneras","Limpieza de puertas y piso exterior","Limpieza a profundidad"],"idx":1},{"n":3,"proceso":"Abasticimiento de toallas","semana":"Semana 1","actividades":["Abastecimiento acuática","Doblar toallas usadas","Envío toallas usadas a concierge"],"idx":2},{"n":4,"proceso":"Limpieza de tapetes","semana":"Semana 1","actividades":["Selección de materiales","Limpieza de tapetes de piso","Envío de evidencia"],"idx":3},{"n":5,"proceso":"Limpieza de vidrios y espejos","semana":"Semana 1","actividades":["Selección de materiales","Limpieza de vidrios y cristales","Pulir espejos con paño y limpiador"],"idx":4},{"n":6,"proceso":"Limpieza de Sanitarios","semana":"Semana 2","actividades":["Selección de recursos","Limpieza de excusado","Limpieza de puerta","Limpieza piso","Reposición de papel","Retirado de papel sanitario","Lavado a detalle"],"idx":5},{"n":7,"proceso":"Abastecimiento de Insumos de limpieza:Papel de manos, Papel de baño, Jabón manos, Shampoo, Acondicionador, Jabon de cuerpo","semana":"Semana 2","actividades":["Surtido de insumos a bodega fuerza","Relleno de suministros"],"idx":6},{"n":8,"proceso":"Abastecimiento de servicio premium: Café, sobres de té, splenda, mentas, vitroleras con agua y clorofila","semana":"Semana 2","actividades":["Recarga de suministros","Relleno de material en cajón interno"],"idx":7},{"n":9,"proceso":"Limpieza de tapetes","semana":"Semana 2","actividades":["Selección de materiales","Limpieza de tapetes servicio socio","Limpieza de tapetes de piso","Envío de evidencia"],"idx":8},{"n":10,"proceso":"Limpieza y cuidado de plantas y macetas","semana":"Semana 2","actividades":["Selección de recursos","Limpieza maceta","Cuidado de planta","Riego de planta","Detección de cuidados externos"],"idx":9},{"n":11,"proceso":"Limpieza de locker","semana":"Semana 3","actividades":["Selección de recursos","Limpieza exterior","Limpieza interior","Limpieza específico y superior"],"idx":10},{"n":12,"proceso":"Limpieza de ventilador","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de helices, luminaria y eje-motor"],"idx":11},{"n":13,"proceso":"Limpieza de muros de madera","semana":"Semana 3","actividades":["Selección de recursos","Limpieza de muro"],"idx":12},{"n":14,"proceso":"Lavado de marcos de ventanas y puertas","semana":"Semana 3","actividades":["Selección de materiales","Limpieza de áreas","Limpieza de contactos de luz","Limpieza de percianas","Limpieza de zonas altas"],"idx":13},{"n":15,"proceso":"Lavado de despachadores de agua","semana":"Semana 3","actividades":["Retirado de garrafones","Limpieza de despachadores"],"idx":14},{"n":16,"proceso":"Limpieza de aires acondicionado","semana":"Semana 4","actividades":["Selección de recursos","Limpieza de aire acondicionado externa"],"idx":15},{"n":17,"proceso":"Pulido de piso","semana":"Semana 4","actividades":["Selección de material","Pulido de piso","Acomodo de maquinas/ material","Trapeado de piso"],"idx":16},{"n":18,"proceso":"Recolección de basura lavado del cuarto de basura","semana":"Semana 4","actividades":["Vaciado de basura a contenedor general","Entrega de basura caminón","Lavado de contenedor y tambo"],"idx":17},{"n":19,"proceso":"5´s Bodega","semana":"Semana 4","actividades":["Identificación de necesidades","Completar los materiales","Acomodo de materiales"],"idx":18}],"total_procesos":19,"total_actividades":65},"Técnico Estacionamiento":{"departamento":"Orden y Limpieza","procesos":[{"n":1,"proceso":"Estacionamiento","semana":"Semana 1","actividades":["Entrega de boleto","Recolección de boleto","Corte de caja","Entrega de dinero"],"idx":0},{"n":2,"proceso":"Abasticimiento de toallas pequeñas","semana":"Semana 1","actividades":["Corte de toallas usadas","Entrega a concierge"],"idx":1},{"n":3,"proceso":"Limpieza de vidrios y espejos","semana":"Semana 2","actividades":["Selección de materiales","Limpieza de vidrios y cristales","Pulir espejos con paño y limpiador"],"idx":2},{"n":4,"proceso":"Limpieza de piso","semana":"Semana 2","actividades":["Selección de materiales","Barrido de piso"],"idx":3},{"n":5,"proceso":"Limpieza y cuidado de plantas y macetas","semana":"Semana 3","actividades":["Selección de recursos","Limpieza maceta","Cuidado de planta","Riego de planta","Detección de cuidados externos"],"idx":4},{"n":6,"proceso":"Recolección de basura lavado del cuarto de basura","semana":"Semana 3","actividades":["Vaciado de basura a contenedor general","Entrega de basura caminón","Lavado de contenedor y tambo"],"idx":5},{"n":7,"proceso":"5´s Bodega","semana":"Semana 4","actividades":["Identificación de necesidades","Completar los materiales","Acomodo de materiales"],"idx":6}],"total_procesos":7,"total_actividades":22}}};

/* CERT_DATA vive en memoria como `let` para poder sobrescribirse con la
   versión guardada en Firestore (editada por el administrador). Arranca
   con los datos embebidos como valor por defecto / semilla inicial. */
let CERT_DATA = DEFAULT_CERT_DATA;

const SUCURSALES = [
  "Naciones Unidas", "Valle Real", "Gourmetería", "La Estancia",
  "Ávila Camacho", "Cañadas", "Aleira", "Estructura y Soporte"
];

const BRAND = {
  green: "#2E6B2E",
  greenDark: "#1D4A1D",
  greenSoft: "#EAF3EA",
};

const CONFIANZA_OPCIONES = [
  { value: "domino", label: "Lo puedo hacer solo/a, sin ayuda", color: "#2E6B2E" },
  { value: "apoyo", label: "Lo puedo hacer, pero a veces necesito apoyo", color: "#C98A1B" },
  { value: "no_practicado", label: "Todavía no lo he practicado", color: "#B0483F" },
];

/* ---------------- helpers ---------------- */
function uid() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function fmtDate(iso) {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length < 3) return iso;
  const [y, m, d] = parts;
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
}
function normaliza(s) {
  return (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function matchesName(query, fullName) {
  const words = normaliza(query).split(/\s+/).filter(Boolean);
  const target = normaliza(fullName);
  return words.length > 0 && words.every((w) => target.includes(w));
}
function sameLider(a, b) {
  if (!a || !a.trim() || !b || !b.trim()) return false;
  if (normaliza(a) === normaliza(b)) return true;
  return matchesName(a, b) || matchesName(b, a);
}
function findCanonicalLider(typed, index) {
  const typedTrim = (typed || "").trim();
  if (!typedTrim) return typedTrim;
  const canonicalNames = [];
  const seen = new Set();
  index.forEach((c) => {
    const name = (c.lider || "").trim();
    const key = normaliza(name);
    if (name && !seen.has(key)) {
      seen.add(key);
      canonicalNames.push(name);
    }
  });
  const exact = canonicalNames.find((n) => normaliza(n) === normaliza(typedTrim));
  if (exact) return exact;
  const fuzzy = canonicalNames.find((n) => sameLider(typedTrim, n));
  return fuzzy || typedTrim;
}
function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const letters = parts.map((w) => w[0] || "").join("").toUpperCase();
  return letters || "?";
}

function computeStatus(cert, roleTpl) {
  if (!roleTpl) return { pct: 0, estado: "sin_iniciar", done: 0, total: 0 };
  const total = roleTpl.procesos.reduce((s, p) => s + p.actividades.length, 0);
  let done = 0;
  roleTpl.procesos.forEach((p) => {
    const entry = cert.checklist ? cert.checklist[p.idx] : null;
    if (entry && entry.checks) done += entry.checks.filter(Boolean).length;
  });
  const pct = total ? Math.round((done / total) * 100) : 0;
  let estado = "sin_iniciar";
  if (pct >= 100 && total > 0) estado = "certificado";
  else if (pct > 0) estado = "en_progreso";
  return { pct, estado, done, total };
}
function procesoCompleto(cert, proceso) {
  const entry = cert.checklist ? cert.checklist[proceso.idx] : null;
  if (!entry || !entry.checks) return false;
  return proceso.actividades.every((_, i) => entry.checks[i]);
}

/* ---------------- almacenamiento (Firestore) ----------------
   Sustituye a window.storage (API exclusiva de los artifacts de claude.ai).
   Cada clave vive como un documento en la colección "kv" (mismo patrón
   clave→valor que antes), para no tener que tocar el resto del código. */
const IDX_KEY = "geb_cert_rol_index_v1";
function certKey(id) {
  return "geb_cert_rol_" + id;
}
async function kvGet(key) {
  const snap = await getDoc(doc(db, "kv", key));
  return snap.exists() ? snap.data().value : null;
}
async function kvSet(key, value) {
  await setDoc(doc(db, "kv", key), { value });
}
async function kvDelete(key) {
  await deleteDoc(doc(db, "kv", key));
}
async function storageGetIndex() {
  try {
    const value = await kvGet(IDX_KEY);
    return value || [];
  } catch (e) {
    return [];
  }
}
async function storageSetIndex(list) {
  try {
    await kvSet(IDX_KEY, list);
  } catch (e) {
    console.error("No se pudo guardar el índice de certificaciones", e);
  }
}
async function storageGetCert(id) {
  try {
    const value = await kvGet(certKey(id));
    return value || null;
  } catch (e) {
    return null;
  }
}
async function storageSetCert(cert) {
  try {
    await kvSet(certKey(cert.id), cert);
  } catch (e) {
    console.error("No se pudo guardar la certificación", e);
  }
}
async function storageDeleteCert(id) {
  try {
    await kvDelete(certKey(id));
  } catch (e) {
    /* ok si ya no existe */
  }
  const idx = await storageGetIndex();
  const next = idx.filter((x) => x.id !== id);
  await storageSetIndex(next);
  return next;
}

/* ---------------- plantillas de rol (editables) ----------------
   CERT_DATA se guarda también bajo la misma colección "kv", así que
   los cambios que haga el administrador persisten en Firestore. */
const CERT_DATA_KEY = "geb_cert_data_v1";
async function loadCertData() {
  try {
    const stored = await kvGet(CERT_DATA_KEY);
    if (stored && stored.roles && Object.keys(stored.roles).length) {
      CERT_DATA = stored;
    } else {
      await kvSet(CERT_DATA_KEY, CERT_DATA);
    }
  } catch (e) {
    console.error("No se pudieron cargar las plantillas de rol desde Firestore, usando datos embebidos", e);
  }
}
async function saveCertData(nextData) {
  CERT_DATA = nextData;
  await kvSet(CERT_DATA_KEY, nextData);
}

function useFonts() {
  useEffect(() => {
    if (document.getElementById("geb-fonts")) return;
    const link = document.createElement("link");
    link.id = "geb-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=League+Spartan:wght@500;600;700;800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap";
    document.head.appendChild(link);
  }, []);
}
const DISPLAY_FONT = "'League Spartan', sans-serif";

/* ============================================================
   ATOMOS DE UI
   ============================================================ */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 size={26} className="animate-spin" style={{ color: BRAND.green }} />
    </div>
  );
}

function EstadoBadge({ estado, pct }) {
  const map = {
    sin_iniciar: { label: "Sin iniciar", cls: "bg-red-50 text-red-700 border-red-200", dot: "#B0483F" },
    en_progreso: { label: `En progreso · ${pct}%`, cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "#C98A1B" },
    certificado: { label: "Certificado", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: BRAND.green },
  };
  const s = map[estado] || map.sin_iniciar;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  );
}

function ProgressBar({ pct }) {
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: BRAND.green }}
      />
    </div>
  );
}

function RutaSemanas({ roleTpl, cert }) {
  const semanas = useMemo(() => {
    const list = [];
    roleTpl.procesos.forEach((p) => {
      if (p.semana && !list.includes(p.semana)) list.push(p.semana);
    });
    return list;
  }, [roleTpl]);

  if (semanas.length === 0) return null;

  return (
    <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 mb-1 -mx-1 px-1">
      {semanas.map((sem, i) => {
        const procesosSem = roleTpl.procesos.filter((p) => p.semana === sem);
        const completos = procesosSem.filter((p) => procesoCompleto(cert, p)).length;
        const full = completos === procesosSem.length;
        const some = completos > 0 && !full;
        return (
          <React.Fragment key={sem}>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                style={{
                  borderColor: full ? BRAND.green : some ? "#C98A1B" : "#D8DED8",
                  backgroundColor: full ? BRAND.green : "#fff",
                  color: full ? "#fff" : some ? "#C98A1B" : "#8A968A",
                }}
              >
                {full ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                {sem.replace("Semana", "Sem.")}
              </span>
            </div>
            {i < semanas.length - 1 && (
              <div className="w-6 sm:w-10 h-0.5 shrink-0 mb-4" style={{ backgroundColor: full ? BRAND.green : "#E2E8E2" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: BRAND.greenSoft }}>
        <Icon size={26} style={{ color: BRAND.green }} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: DISPLAY_FONT }}>
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{subtitle}</p>
      {action}
    </div>
  );
}

function TopBar({ title, subtitle, onBack, right }) {
  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition shrink-0"
          aria-label="Volver"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <img src={logoGebUniversity} alt="GEB University" className="h-7 w-auto shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-800 truncate" style={{ fontFamily: DISPLAY_FONT }}>
            {title}
          </h1>
          {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function FiltroSelect({ value, onChange, placeholder, options, labeled }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <option value="">{placeholder}</option>
      {options.map((o) =>
        labeled ? (
          <option key={o[0]} value={o[0]}>
            {o[1]}
          </option>
        ) : (
          <option key={o} value={o}>
            {o}
          </option>
        )
      )}
    </select>
  );
}

function CertRow({ c, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 hover:border-slate-300 hover:shadow-sm transition-all flex items-center gap-3 sm:gap-4"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
        style={{ backgroundColor: BRAND.greenSoft, color: BRAND.green }}
      >
        {initials(c.colaborador)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-800 truncate text-sm sm:text-base">{c.colaborador}</div>
        <div className="text-xs text-slate-500 truncate flex items-center gap-1">
          <span>{c.rol}</span>
          <span className="text-slate-300">·</span>
          <MapPin size={10} className="shrink-0" />
          <span>{c.sucursal}</span>
        </div>
      </div>
      <div className="hidden md:block w-28 shrink-0">
        <ProgressBar pct={c.pct} />
      </div>
      <EstadoBadge estado={c.estado} pct={c.pct} />
      <ChevronRight size={18} className="text-slate-300 shrink-0 hidden sm:block" />
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5">
      <div className="text-2xl font-extrabold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: color || "#1e293b" }}>
        {value}
      </div>
      <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
    </div>
  );
}

function NameGate({ icon: Icon, title, subtitle, value, onChange, onSubmit, onBack, placeholder }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar title="Certificación de Rol" onBack={onBack} />
      <div className="flex-1 flex items-center justify-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) onSubmit();
          }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: BRAND.greenSoft }}>
            <Icon size={26} style={{ color: BRAND.green }} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: DISPLAY_FONT }}>
            {title}
          </h2>
          <p className="text-sm text-slate-500 mb-5">{subtitle}</p>
          <input
            autoFocus
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none mb-3 bg-white"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition"
            style={{ backgroundColor: BRAND.green }}
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "";

function AdminPasswordGate({ onSuccess, onBack }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <TopBar title="Certificación de Rol" onBack={onBack} />
      <div className="flex-1 flex items-center justify-center px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ backgroundColor: BRAND.greenSoft }}>
            <Building2 size={26} style={{ color: BRAND.green }} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1" style={{ fontFamily: DISPLAY_FONT }}>
            Acceso de administrador
          </h2>
          <p className="text-sm text-slate-500 mb-5">Ingresa la contraseña para continuar.</p>
          <input
            autoFocus
            type="password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="Contraseña"
            className={`w-full border rounded-xl px-4 py-3 text-center text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none mb-2 bg-white ${
              error ? "border-red-400" : "border-slate-200"
            }`}
          />
          {error && <p className="text-xs text-red-500 mb-3">Contraseña incorrecta.</p>}
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition"
            style={{ backgroundColor: BRAND.green }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

function ChecklistReadOnly({ roleTpl, cert }) {
  return (
    <div className="space-y-3">
      {roleTpl.procesos.map((p) => {
        const entry = cert.checklist ? cert.checklist[p.idx] : null;
        const checks = (entry && entry.checks) || [];
        const done = checks.filter(Boolean).length;
        return (
          <div key={p.idx} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="font-semibold text-sm text-slate-800">
                {p.idx + 1}. {p.proceso}
              </span>
              <span className="text-xs text-slate-400 font-mono shrink-0">
                {done}/{p.actividades.length}
              </span>
            </div>
            <ul className="space-y-1">
              {p.actividades.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  {checks[i] ? (
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: BRAND.green }} />
                  ) : (
                    <Circle size={15} className="mt-0.5 shrink-0 text-slate-300" />
                  )}
                  <span className={checks[i] ? "" : "text-slate-400"}>{a}</span>
                </li>
              ))}
            </ul>
            {entry && entry.observaciones && (
              <p className="text-xs text-slate-500 mt-2 italic border-t border-slate-100 pt-2">“{entry.observaciones}”</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AutoevalSummary({ cert }) {
  const conf = (cert.autoeval && cert.autoeval.confianza) || {};
  const counts = { domino: 0, apoyo: 0, no_practicado: 0 };
  Object.values(conf).forEach((v) => {
    if (counts[v] !== undefined) counts[v]++;
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mt-5">
      <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2" style={{ fontFamily: DISPLAY_FONT }}>
        <MessageSquareText size={16} style={{ color: BRAND.green }} /> Autoevaluación del colaborador
      </h3>
      {total === 0 ? (
        <p className="text-xs text-slate-400">Aún no ha respondido su autoevaluación.</p>
      ) : (
        <div className="flex flex-wrap gap-4 text-sm">
          {CONFIANZA_OPCIONES.map((o) => (
            <div key={o.value} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: o.color }} />
              <span className="text-slate-600">
                {counts[o.value]} <span className="text-slate-400">· {o.label}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition ${
        active ? "bg-white shadow-sm text-slate-800" : "text-slate-500"
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

/* ============================================================
   LANDING
   ============================================================ */
function Landing({ onSelect }) {
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${BRAND.greenSoft} 0%, #ffffff 380px)` }}>
      <div className="max-w-3xl mx-auto px-6 pt-14 sm:pt-20 pb-8 text-center">
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
          <img src={logoGebUniversity} alt="GEB University" className="h-14 sm:h-16 w-auto" />
          <div className="w-px h-10 sm:h-12 bg-slate-200" />
          <img src={logoGeb} alt="Grupo Empresarial Bienestar" className="h-14 sm:h-16 w-auto" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-5" style={{ borderColor: BRAND.green }}>
          <span className="text-xs font-bold tracking-wide" style={{ color: BRAND.green }}>
            VIVO 47
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.05] mb-4" style={{ fontFamily: DISPLAY_FONT }}>
          Certificación de Rol,
          <br />
          en línea
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
          Ruta de certificación semana por semana, desde cualquier sucursal.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 grid gap-4 sm:grid-cols-3">
        <RoleCard
          icon={Building2}
          title="Administrador"
          desc="Crea certificaciones para nuevos colaboradores y da seguimiento general."
          onClick={() => onSelect("admin")}
        />
        <RoleCard
          icon={Users}
          title="Certificador"
          desc="Certifica a tu equipo marcando actividades semana por semana."
          onClick={() => onSelect("lider")}
        />
        <RoleCard
          icon={UserCircle2}
          title="Colaborador"
          desc="Consulta tu avance y responde tu autoevaluación."
          onClick={() => onSelect("colaborador")}
        />
      </div>
    </div>
  );
}

function RoleCard({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-lg transition-all group"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: BRAND.greenSoft }}>
        <Icon size={22} style={{ color: BRAND.green }} />
      </div>
      <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-1" style={{ fontFamily: DISPLAY_FONT }}>
        {title}
        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </h3>
      <p className="text-sm text-slate-500 leading-snug">{desc}</p>
    </button>
  );
}

/* ============================================================
   ADMINISTRADOR
   ============================================================ */
function AdminPanel({ index, onBack, onRefresh }) {
  const [showNew, setShowNew] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filtros, setFiltros] = useState({ depto: "", rol: "", sucursal: "", estado: "" });

  const filtered = useMemo(() => {
    return index
      .filter(
        (c) =>
          (!filtros.depto || c.departamento === filtros.depto) &&
          (!filtros.rol || c.rol === filtros.rol) &&
          (!filtros.sucursal || c.sucursal === filtros.sucursal) &&
          (!filtros.estado || c.estado === filtros.estado)
      )
      .sort((a, b) => (b.actualizadoEn || "").localeCompare(a.actualizadoEn || ""));
  }, [index, filtros]);

  const stats = useMemo(() => {
    const total = index.length;
    const certificadas = index.filter((c) => c.estado === "certificado").length;
    const enProgreso = index.filter((c) => c.estado === "en_progreso").length;
    const sinIniciar = index.filter((c) => c.estado === "sin_iniciar").length;
    return { total, certificadas, enProgreso, sinIniciar };
  }, [index]);

  if (showTemplates) {
    return <RoleTemplatesPanel onBack={() => setShowTemplates(false)} />;
  }

  if (showAnalytics) {
    return <AnalyticsPanel index={index} onBack={() => setShowAnalytics(false)} />;
  }

  if (detailId) {
    return (
      <AdminCertDetail
        id={detailId}
        onBack={() => setDetailId(null)}
        onDeleted={() => {
          setDetailId(null);
          onRefresh();
        }}
        onUpdated={onRefresh}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        title="Panel de administrador"
        subtitle="GEB University · Certificación de Rol VIVO 47"
        onBack={onBack}
        right={
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAnalytics(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <BarChart3 size={16} /> <span className="hidden xs:inline">Analítica</span>
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ListChecks size={16} /> <span className="hidden xs:inline">Plantillas</span>
            </button>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold"
              style={{ backgroundColor: BRAND.green }}
            >
              <Plus size={16} /> <span className="hidden xs:inline">Nueva</span>
            </button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <BarChart3 size={14} className="text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Resumen</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Certificadas" value={stats.certificadas} color={BRAND.green} />
          <StatCard label="En progreso" value={stats.enProgreso} color="#C98A1B" />
          <StatCard label="Sin iniciar" value={stats.sinIniciar} color="#B0483F" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <FiltroSelect
            value={filtros.depto}
            onChange={(v) => setFiltros((f) => ({ ...f, depto: v, rol: "" }))}
            placeholder="Departamento"
            options={Object.keys(CERT_DATA.departamentos)}
          />
          <FiltroSelect
            value={filtros.rol}
            onChange={(v) => setFiltros((f) => ({ ...f, rol: v }))}
            placeholder="Rol"
            options={filtros.depto ? CERT_DATA.departamentos[filtros.depto] : Object.keys(CERT_DATA.roles)}
          />
          <FiltroSelect
            value={filtros.sucursal}
            onChange={(v) => setFiltros((f) => ({ ...f, sucursal: v }))}
            placeholder="Sucursal"
            options={SUCURSALES}
          />
          <FiltroSelect
            value={filtros.estado}
            onChange={(v) => setFiltros((f) => ({ ...f, estado: v }))}
            placeholder="Estado"
            options={[
              ["sin_iniciar", "Sin iniciar"],
              ["en_progreso", "En progreso"],
              ["certificado", "Certificado"],
            ]}
            labeled
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={index.length === 0 ? "Aún no hay certificaciones" : "Sin resultados"}
            subtitle={
              index.length === 0
                ? "Crea la certificación de un nuevo colaborador para comenzar su seguimiento."
                : "Ajusta los filtros para ver más resultados."
            }
            action={
              index.length === 0 && (
                <button
                  onClick={() => setShowNew(true)}
                  className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
                  style={{ backgroundColor: BRAND.green }}
                >
                  + Nueva certificación
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <CertRow key={c.id} c={c} onClick={() => setDetailId(c.id)} />
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <NewCertModal
          onClose={() => setShowNew(false)}
          onCreated={(id) => {
            setShowNew(false);
            onRefresh();
            setDetailId(id);
          }}
        />
      )}
    </div>
  );
}

function NewCertModal({ onClose, onCreated }) {
  const [depto, setDepto] = useState("");
  const [rol, setRol] = useState("");
  const [colaborador, setColaborador] = useState("");
  const [sucursal, setSucursal] = useState("");
  const [lider, setLider] = useState("");
  const [fecha, setFecha] = useState(todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rolesDisponibles = depto ? CERT_DATA.departamentos[depto] : [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!depto || !rol || !colaborador.trim() || !sucursal) {
      setError("Completa departamento, rol, colaborador y sucursal.");
      return;
    }
    setSaving(true);
    const id = uid();
    const nowIso = new Date().toISOString();
    const cert = {
      id,
      colaborador: colaborador.trim(),
      rol,
      departamento: depto,
      sucursal,
      lider: lider.trim(),
      fechaInicio: fecha,
      creadoEn: nowIso,
      checklist: {},
      autoeval: { confianza: {}, reflexion: {} },
    };
    await storageSetCert(cert);
    const idx = await storageGetIndex();
    idx.push({
      id,
      colaborador: cert.colaborador,
      rol,
      departamento: depto,
      sucursal,
      lider: cert.lider,
      fechaInicio: fecha,
      estado: "sin_iniciar",
      pct: 0,
      actualizadoEn: nowIso,
    });
    await storageSetIndex(idx);
    setSaving(false);
    onCreated(id);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-800" style={{ fontFamily: DISPLAY_FONT }}>
            Nueva certificación
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Departamento">
            <select
              value={depto}
              onChange={(e) => {
                setDepto(e.target.value);
                setRol("");
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="">Selecciona…</option>
              {Object.keys(CERT_DATA.departamentos).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rol">
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              disabled={!depto}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm disabled:bg-slate-50 disabled:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="">{depto ? "Selecciona…" : "Elige un departamento primero"}</option>
              {rolesDisponibles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre del colaborador">
            <input
              value={colaborador}
              onChange={(e) => setColaborador(e.target.value)}
              placeholder="Nombre y apellido"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sucursal">
              <select
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="">Selecciona…</option>
                {SUCURSALES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fecha de inicio">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </Field>
          </div>
          <Field label="Certificador (opcional)">
            <input
              value={lider}
              onChange={(e) => setLider(e.target.value)}
              placeholder="Nombre del certificador"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: BRAND.green }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {saving ? "Creando…" : "Crear certificación"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditCertModal({ cert, onClose, onSaved }) {
  const [depto, setDepto] = useState(cert.departamento);
  const [rol, setRol] = useState(cert.rol);
  const [colaborador, setColaborador] = useState(cert.colaborador);
  const [sucursal, setSucursal] = useState(cert.sucursal);
  const [lider, setLider] = useState(cert.lider || "");
  const [fecha, setFecha] = useState(cert.fechaInicio || todayISO());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const rolesDisponibles = depto ? CERT_DATA.departamentos[depto] : [];
  const rolChanged = rol !== cert.rol;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!depto || !rol || !colaborador.trim() || !sucursal) {
      setError("Completa departamento, rol, colaborador y sucursal.");
      return;
    }
    setSaving(true);
    const updatedCert = {
      ...cert,
      colaborador: colaborador.trim(),
      rol,
      departamento: depto,
      sucursal,
      lider: lider.trim(),
      fechaInicio: fecha,
      ...(rolChanged ? { checklist: {}, autoeval: { confianza: {}, reflexion: {} } } : {}),
    };
    await storageSetCert(updatedCert);
    const { pct, estado } = computeStatus(updatedCert, CERT_DATA.roles[rol]);
    const idx = await storageGetIndex();
    const i = idx.findIndex((x) => x.id === cert.id);
    if (i >= 0) {
      idx[i] = {
        ...idx[i],
        colaborador: updatedCert.colaborador,
        rol,
        departamento: depto,
        sucursal,
        lider: updatedCert.lider,
        fechaInicio: fecha,
        estado,
        pct,
        actualizadoEn: new Date().toISOString(),
      };
      await storageSetIndex(idx);
    }
    setSaving(false);
    onSaved(updatedCert);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-6" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-slate-800" style={{ fontFamily: DISPLAY_FONT }}>
            Editar certificación
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Departamento">
            <select
              value={depto}
              onChange={(e) => {
                setDepto(e.target.value);
                setRol("");
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="">Selecciona…</option>
              {Object.keys(CERT_DATA.departamentos).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Rol">
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              disabled={!depto}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm disabled:bg-slate-50 disabled:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
            >
              <option value="">{depto ? "Selecciona…" : "Elige un departamento primero"}</option>
              {rolesDisponibles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {rolChanged && (
              <p className="text-xs text-amber-600 mt-1.5">
                Cambiar el rol reinicia el checklist y la autoevaluación de este colaborador.
              </p>
            )}
          </Field>
          <Field label="Nombre del colaborador">
            <input
              value={colaborador}
              onChange={(e) => setColaborador(e.target.value)}
              placeholder="Nombre y apellido"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sucursal">
              <select
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
              >
                <option value="">Selecciona…</option>
                {SUCURSALES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fecha de inicio">
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </Field>
          </div>
          <Field label="Certificador (opcional)">
            <input
              value={lider}
              onChange={(e) => setLider(e.target.value)}
              placeholder="Nombre del certificador"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: BRAND.green }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminCertDetail({ id, onBack, onDeleted, onUpdated }) {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    let active = true;
    storageGetCert(id).then((c) => {
      if (active) {
        setCert(c);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    await storageDeleteCert(id);
    setDeleting(false);
    onDeleted();
  }

  if (loading) return <LoadingScreen />;
  if (!cert)
    return (
      <EmptyState
        icon={Info}
        title="No se encontró la certificación"
        subtitle="Es posible que haya sido eliminada."
        action={
          <button onClick={onBack} className="text-sm font-semibold" style={{ color: BRAND.green }}>
            Volver
          </button>
        }
      />
    );

  const roleTpl = CERT_DATA.roles[cert.rol];
  const { pct, estado } = computeStatus(cert, roleTpl);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        title={cert.colaborador}
        subtitle={`${cert.rol} · ${cert.departamento}`}
        onBack={onBack}
        right={<EstadoBadge estado={estado} pct={pct} />}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5">
          <RutaSemanas roleTpl={roleTpl} cert={cert} />
          <ProgressBar pct={pct} />
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users size={12} /> Certificador: <b className="text-slate-700">{cert.lider || "—"}</b>
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Inicio: <b className="text-slate-700">{fmtDate(cert.fechaInicio)}</b>
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> <b className="text-slate-700">{cert.sucursal}</b>
              </span>
            </div>
            <button
              onClick={() => setShowEdit(true)}
              className="text-xs font-semibold shrink-0"
              style={{ color: BRAND.green }}
            >
              Editar
            </button>
          </div>
        </div>

        <ChecklistReadOnly roleTpl={roleTpl} cert={cert} />

        <AutoevalSummary cert={cert} />

        <div className="mt-6 pt-4 border-t border-slate-200">
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="text-xs text-red-500 hover:text-red-700 font-medium">
              Eliminar esta certificación
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-600">¿Seguro? Esta acción no se puede deshacer.</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-md disabled:opacity-60"
              >
                {deleting ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-slate-400 hover:text-slate-600">
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {showEdit && (
        <EditCertModal
          cert={cert}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            setCert(updated);
            setShowEdit(false);
            onUpdated();
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   PLANTILLAS DE ROL (procesos y actividades)
   ============================================================ */
function nextIdx(procesos) {
  return procesos.reduce((max, p) => Math.max(max, p.idx), -1) + 1;
}

function RoleTemplatesPanel({ onBack }) {
  const [depto, setDepto] = useState("");
  const [rolNombre, setRolNombre] = useState("");
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(0);

  function selectRole(name) {
    setRolNombre(name);
    setDraft(JSON.parse(JSON.stringify(CERT_DATA.roles[name])));
    setSavedAt(0);
  }

  function updateProceso(pIdx, patch) {
    setDraft((d) => ({
      ...d,
      procesos: d.procesos.map((p, i) => (i === pIdx ? { ...p, ...patch } : p)),
    }));
  }

  function updateActividad(pIdx, aIdx, text) {
    setDraft((d) => ({
      ...d,
      procesos: d.procesos.map((p, i) =>
        i === pIdx ? { ...p, actividades: p.actividades.map((a, j) => (j === aIdx ? text : a)) } : p
      ),
    }));
  }

  function addActividad(pIdx) {
    setDraft((d) => ({
      ...d,
      procesos: d.procesos.map((p, i) => (i === pIdx ? { ...p, actividades: [...p.actividades, ""] } : p)),
    }));
  }

  function removeActividad(pIdx, aIdx) {
    setDraft((d) => ({
      ...d,
      procesos: d.procesos.map((p, i) =>
        i === pIdx ? { ...p, actividades: p.actividades.filter((_, j) => j !== aIdx) } : p
      ),
    }));
  }

  function addProceso() {
    setDraft((d) => ({
      ...d,
      procesos: [
        ...d.procesos,
        { n: d.procesos.length + 1, proceso: "Nuevo proceso", semana: "", actividades: [""], idx: nextIdx(d.procesos) },
      ],
    }));
  }

  function removeProceso(pIdx) {
    setDraft((d) => ({ ...d, procesos: d.procesos.filter((_, i) => i !== pIdx) }));
  }

  function updateAutoevalSemana(sIdx, semana) {
    setDraft((d) => ({
      ...d,
      autoevaluacion: d.autoevaluacion.map((s, i) => (i === sIdx ? { ...s, semana } : s)),
    }));
  }

  function updatePregunta(sIdx, qIdx, text) {
    setDraft((d) => ({
      ...d,
      autoevaluacion: d.autoevaluacion.map((s, i) =>
        i === sIdx ? { ...s, preguntas: s.preguntas.map((q, j) => (j === qIdx ? text : q)) } : s
      ),
    }));
  }

  function addPregunta(sIdx) {
    setDraft((d) => ({
      ...d,
      autoevaluacion: d.autoevaluacion.map((s, i) => (i === sIdx ? { ...s, preguntas: [...s.preguntas, ""] } : s)),
    }));
  }

  function removePregunta(sIdx, qIdx) {
    setDraft((d) => ({
      ...d,
      autoevaluacion: d.autoevaluacion.map((s, i) =>
        i === sIdx ? { ...s, preguntas: s.preguntas.filter((_, j) => j !== qIdx) } : s
      ),
    }));
  }

  function addAutoevalBloque() {
    setDraft((d) => ({
      ...d,
      autoevaluacion: [...(d.autoevaluacion || []), { semana: `Semana ${(d.autoevaluacion || []).length + 1}`, preguntas: [""] }],
    }));
  }

  function removeAutoevalBloque(sIdx) {
    setDraft((d) => ({ ...d, autoevaluacion: d.autoevaluacion.filter((_, i) => i !== sIdx) }));
  }

  async function handleSave() {
    setSaving(true);
    const cleaned = {
      ...draft,
      procesos: draft.procesos
        .map((p) => ({ ...p, actividades: p.actividades.map((a) => a.trim()).filter(Boolean) }))
        .filter((p) => p.proceso.trim() && p.actividades.length > 0),
    };
    if (cleaned.autoevaluacion) {
      cleaned.autoevaluacion = cleaned.autoevaluacion
        .map((s) => ({ ...s, preguntas: s.preguntas.map((q) => q.trim()).filter(Boolean) }))
        .filter((s) => s.preguntas.length > 0);
      if (cleaned.autoevaluacion.length === 0) delete cleaned.autoevaluacion;
    }
    cleaned.total_procesos = cleaned.procesos.length;
    cleaned.total_actividades = cleaned.procesos.reduce((s, p) => s + p.actividades.length, 0);
    await saveCertData({ ...CERT_DATA, roles: { ...CERT_DATA.roles, [rolNombre]: cleaned } });
    setDraft(cleaned);
    setSaving(false);
    setSavedAt(Date.now());
  }

  const rolesDisponibles = depto ? CERT_DATA.departamentos[depto] : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar title="Plantillas de rol" subtitle="Procesos, actividades y autoevaluación" onBack={onBack} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5 mb-5 text-xs text-amber-800">
          <Info size={15} className="shrink-0 mt-0.5" />
          <p>
            Estos cambios afectan a todos los colaboradores certificándose en este rol. Si agregas o quitas actividades de
            un proceso que algún colaborador ya trae en progreso, ese proceso reinicia su avance marcado (para no dejar
            checks desalineados).
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <FiltroSelect
            value={depto}
            onChange={(v) => {
              setDepto(v);
              setRolNombre("");
              setDraft(null);
            }}
            placeholder="Departamento"
            options={Object.keys(CERT_DATA.departamentos)}
          />
          <FiltroSelect
            value={rolNombre}
            onChange={selectRole}
            placeholder="Rol"
            options={depto ? rolesDisponibles : Object.keys(CERT_DATA.roles)}
          />
        </div>

        {!draft ? (
          <EmptyState icon={ListChecks} title="Elige un rol" subtitle="Selecciona un departamento y un rol para editar su plantilla." />
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {draft.procesos.map((p, pIdx) => (
                <div key={p.idx} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <input
                      value={p.proceso}
                      onChange={(e) => updateProceso(pIdx, { proceso: e.target.value })}
                      placeholder="Nombre del proceso"
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    <input
                      value={p.semana || ""}
                      onChange={(e) => updateProceso(pIdx, { semana: e.target.value })}
                      placeholder="Semana (opcional)"
                      className="w-32 shrink-0 border border-slate-200 rounded-lg px-2.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    <button
                      onClick={() => removeProceso(pIdx)}
                      className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50"
                      title="Eliminar proceso"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-1.5 mb-2">
                    {p.actividades.map((a, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-2">
                        <input
                          value={a}
                          onChange={(e) => updateActividad(pIdx, aIdx, e.target.value)}
                          placeholder="Actividad"
                          className="flex-1 border border-slate-100 bg-slate-50 rounded-lg px-2.5 py-1.5 text-sm focus:ring-1 focus:ring-emerald-400 outline-none"
                        />
                        <button
                          onClick={() => removeActividad(pIdx, aIdx)}
                          className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addActividad(pIdx)}
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: BRAND.green }}
                  >
                    <Plus size={13} /> Agregar actividad
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addProceso}
              className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 mb-8 flex items-center justify-center gap-1.5"
            >
              <Plus size={15} /> Agregar proceso
            </button>

            <div className="flex items-center gap-2 mb-3">
              <MessageSquareText size={14} className="text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Autoevaluación (opcional)</span>
            </div>

            {(draft.autoevaluacion || []).map((s, sIdx) => (
              <div key={sIdx} className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    value={s.semana}
                    onChange={(e) => updateAutoevalSemana(sIdx, e.target.value)}
                    placeholder="Etiqueta (ej. Semana 1)"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                  <button
                    onClick={() => removeAutoevalBloque(sIdx)}
                    className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50"
                    title="Eliminar bloque"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-1.5 mb-2">
                  {s.preguntas.map((q, qIdx) => (
                    <div key={qIdx} className="flex items-center gap-2">
                      <textarea
                        value={q}
                        onChange={(e) => updatePregunta(sIdx, qIdx, e.target.value)}
                        placeholder="Pregunta de reflexión"
                        rows={1}
                        className="flex-1 border border-slate-100 bg-slate-50 rounded-lg px-2.5 py-1.5 text-sm resize-none focus:ring-1 focus:ring-emerald-400 outline-none"
                      />
                      <button
                        onClick={() => removePregunta(sIdx, qIdx)}
                        className="w-7 h-7 shrink-0 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addPregunta(sIdx)}
                  className="text-xs font-semibold flex items-center gap-1"
                  style={{ color: BRAND.green }}
                >
                  <Plus size={13} /> Agregar pregunta
                </button>
              </div>
            ))}

            <button
              onClick={addAutoevalBloque}
              className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 mb-8 flex items-center justify-center gap-1.5"
            >
              <Plus size={15} /> Agregar bloque de autoevaluación
            </button>

            <div className="sticky bottom-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg disabled:opacity-60"
                style={{ backgroundColor: BRAND.green }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Guardando…" : savedAt ? "Guardado ✓" : "Guardar cambios"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   ANALÍTICA
   ============================================================ */
const ESTADO_LABEL = { certificado: "Certificado", en_progreso: "En progreso", sin_iniciar: "Sin iniciar" };

function groupStats(items, keyFn, labelFn) {
  const map = new Map();
  items.forEach((c) => {
    const key = keyFn(c);
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, {
        key,
        label: labelFn ? labelFn(c) : key,
        total: 0,
        certificado: 0,
        en_progreso: 0,
        sin_iniciar: 0,
        pctSum: 0,
      });
    }
    const g = map.get(key);
    g.total++;
    g[c.estado] = (g[c.estado] || 0) + 1;
    g.pctSum += c.pct || 0;
  });
  return Array.from(map.values())
    .map((g) => ({ ...g, avgPct: g.total ? Math.round(g.pctSum / g.total) : 0 }))
    .sort((a, b) => a.avgPct - b.avgPct);
}

function daysBetween(isoA, isoB) {
  const diff = new Date(isoB) - new Date(isoA);
  return Math.max(0, Math.round(diff / 86400000));
}

function csvEscape(v) {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function exportIndexToCsv(index) {
  const headers = [
    "Colaborador", "Rol", "Departamento", "Sucursal", "Certificador", "Estado",
    "Avance %", "Fecha inicio", "Fecha certificado", "Última actualización",
  ];
  const rows = index.map((c) => [
    c.colaborador,
    c.rol,
    c.departamento,
    c.sucursal,
    c.lider || "",
    ESTADO_LABEL[c.estado] || c.estado,
    c.pct ?? 0,
    fmtDate(c.fechaInicio),
    c.fechaCertificado ? fmtDate(c.fechaCertificado) : "",
    c.actualizadoEn ? fmtDate(c.actualizadoEn.slice(0, 10)) : "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `certificaciones_vivo47_${todayISO()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function MiniBar({ pct, color }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color || BRAND.green }} />
    </div>
  );
}

function GroupStatsTable({ rows }) {
  if (rows.length === 0) return <p className="text-xs text-slate-400 px-1">Sin datos todavía.</p>;
  return (
    <div className="space-y-2">
      {rows.map((g) => (
        <div key={g.key} className="bg-white border border-slate-200 rounded-xl p-3.5">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <span className="text-sm font-semibold text-slate-800 truncate">{g.label}</span>
            <span className="text-xs text-slate-400 shrink-0">
              {g.total} colaborador{g.total === 1 ? "" : "es"} · {g.avgPct}% prom.
            </span>
          </div>
          <MiniBar pct={g.avgPct} color={g.avgPct >= 80 ? BRAND.green : g.avgPct >= 40 ? "#C98A1B" : "#B0483F"} />
          <div className="flex gap-3 mt-1.5 text-[11px] text-slate-400">
            <span>{g.certificado || 0} certificados</span>
            <span>{g.en_progreso || 0} en progreso</span>
            <span>{g.sin_iniciar || 0} sin iniciar</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPanel({ index, onBack }) {
  const [dimension, setDimension] = useState("sucursal");

  const grouped = useMemo(() => {
    if (dimension === "sucursal") return groupStats(index, (c) => c.sucursal, (c) => c.sucursal);
    if (dimension === "departamento") return groupStats(index, (c) => c.departamento, (c) => c.departamento);
    if (dimension === "rol") return groupStats(index, (c) => c.rol, (c) => c.rol);
    return groupStats(
      index,
      (c) => (c.lider && c.lider.trim() ? normaliza(c.lider.trim()) : null),
      (c) => c.lider.trim()
    );
  }, [index, dimension]);

  const tiempos = useMemo(() => {
    const completados = index.filter((c) => c.estado === "certificado" && c.fechaCertificado && c.fechaInicio);
    if (completados.length === 0) return null;
    const dias = completados.map((c) => daysBetween(c.fechaInicio, c.fechaCertificado));
    const promedio = Math.round(dias.reduce((a, b) => a + b, 0) / dias.length);
    const porRol = groupStats(completados, (c) => c.rol, (c) => c.rol).map((g) => {
      const delRol = completados.filter((c) => c.rol === g.key);
      const diasRol = delRol.map((c) => daysBetween(c.fechaInicio, c.fechaCertificado));
      return { rol: g.key, promedio: Math.round(diasRol.reduce((a, b) => a + b, 0) / diasRol.length), n: delRol.length };
    });
    porRol.sort((a, b) => b.promedio - a.promedio);
    return { promedio, total: completados.length, porRol };
  }, [index]);

  const totalConFecha = index.filter((c) => c.fechaCertificado).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        title="Analítica"
        subtitle="Comparativos y tiempos de certificación"
        onBack={onBack}
        right={
          <button
            onClick={() => exportIndexToCsv(index)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
          >
            <Download size={15} /> <span className="hidden xs:inline">Exportar a Excel</span>
          </button>
        }
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <BarChart3 size={14} className="text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Avance comparado</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            ["sucursal", "Sucursal"],
            ["departamento", "Departamento"],
            ["rol", "Rol"],
            ["lider", "Certificador"],
          ].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setDimension(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                dimension === v ? "text-white border-transparent" : "text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
              style={dimension === v ? { backgroundColor: BRAND.green } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
        <GroupStatsTable rows={grouped} />

        <div className="flex items-center gap-1.5 mb-3 px-1 mt-8">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Tiempos de certificación</span>
        </div>
        {!tiempos ? (
          <EmptyState
            icon={Clock}
            title="Aún no hay datos suficientes"
            subtitle="Esta métrica se calcula a partir de certificaciones completadas después de activar este seguimiento. Los colaboradores ya certificados antes no cuentan con fecha registrada."
          />
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3">
              <p className="text-2xl font-bold" style={{ color: BRAND.green, fontFamily: DISPLAY_FONT }}>
                {tiempos.promedio} días
              </p>
              <p className="text-xs text-slate-500">
                Promedio para certificarse, sobre {tiempos.total} colaborador{tiempos.total === 1 ? "" : "es"}
                {totalConFecha < index.filter((c) => c.estado === "certificado").length
                  ? " (algunos certificados antes no cuentan con fecha registrada)"
                  : ""}
              </p>
            </div>
            <div className="space-y-1.5">
              {tiempos.porRol.map((r) => (
                <div key={r.rol} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3.5 py-2.5">
                  <span className="text-sm text-slate-700 truncate">{r.rol}</span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {r.promedio} días · {r.n} colaborador{r.n === 1 ? "" : "es"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   LIDER
   ============================================================ */
function LiderPanel({ index, onBack, onIndexChange }) {
  const [liderNombre, setLiderNombre] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  if (!confirmado) {
    return (
      <NameGate
        icon={Users}
        title="¿Cuál es tu nombre?"
        subtitle="Así quedará registrado como certificador en cada actividad que marques."
        value={liderNombre}
        onChange={setLiderNombre}
        onSubmit={() => {
          setLiderNombre(findCanonicalLider(liderNombre, index));
          setConfirmado(true);
        }}
        onBack={onBack}
        placeholder="Tu nombre completo"
      />
    );
  }

  if (selectedId) {
    return (
      <FillCertView
        id={selectedId}
        liderNombre={liderNombre}
        onBack={() => setSelectedId(null)}
        onIndexChange={onIndexChange}
      />
    );
  }

  return (
    <LiderSearch
      index={index}
      liderNombre={liderNombre}
      onBack={onBack}
      onSelect={setSelectedId}
      onChangeName={() => setConfirmado(false)}
    />
  );
}

function LiderSearch({ index, liderNombre, onBack, onSelect, onChangeName }) {
  const [q, setQ] = useState("");
  const [filtros, setFiltros] = useState({ sucursal: "", depto: "", rol: "" });

  const equipo = useMemo(() => index.filter((c) => sameLider(liderNombre, c.lider)), [index, liderNombre]);

  const filtered = useMemo(() => {
    return equipo
      .filter(
        (c) =>
          (!q.trim() || matchesName(q, c.colaborador)) &&
          (!filtros.sucursal || c.sucursal === filtros.sucursal) &&
          (!filtros.depto || c.departamento === filtros.depto) &&
          (!filtros.rol || c.rol === filtros.rol)
      )
      .sort((a, b) => normaliza(a.colaborador).localeCompare(normaliza(b.colaborador)));
  }, [equipo, q, filtros]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        title="Certificar colaborador"
        subtitle={`Certificador: ${liderNombre}`}
        onBack={onBack}
        right={
          <button onClick={onChangeName} className="text-xs font-semibold text-slate-500 hover:text-slate-700 shrink-0">
            Cambiar
          </button>
        }
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar colaborador por nombre…"
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <FiltroSelect
            value={filtros.depto}
            onChange={(v) => setFiltros((f) => ({ ...f, depto: v, rol: "" }))}
            placeholder="Departamento"
            options={Object.keys(CERT_DATA.departamentos)}
          />
          <FiltroSelect
            value={filtros.rol}
            onChange={(v) => setFiltros((f) => ({ ...f, rol: v }))}
            placeholder="Rol"
            options={filtros.depto ? CERT_DATA.departamentos[filtros.depto] : Object.keys(CERT_DATA.roles)}
          />
          <FiltroSelect
            value={filtros.sucursal}
            onChange={(v) => setFiltros((f) => ({ ...f, sucursal: v }))}
            placeholder="Sucursal"
            options={SUCURSALES}
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title={equipo.length === 0 ? "Aún no tienes colaboradores asignados" : "Sin coincidencias"}
            subtitle={
              equipo.length === 0
                ? "Pide al administrador que te asigne como certificador en la certificación de tu equipo."
                : "Verifica el nombre o ajusta los filtros."
            }
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((c) => (
              <CertRow key={c.id} c={c} onClick={() => onSelect(c.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProcesoCard({ proceso, entry, onToggle, onObsChange }) {
  const [obsLocal, setObsLocal] = useState((entry && entry.observaciones) || "");
  useEffect(() => {
    setObsLocal((entry && entry.observaciones) || "");
  }, [proceso.idx]);

  const checks = (entry && entry.checks) || [];
  const done = checks.filter(Boolean).length;
  const complete = done === proceso.actividades.length;

  return (
    <div className={`bg-white border rounded-xl p-4 transition-colors ${complete ? "border-emerald-200" : "border-slate-200"}`}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0"
            style={{ backgroundColor: complete ? BRAND.green : "#F1F5F1", color: complete ? "#fff" : "#64748b" }}
          >
            {proceso.idx + 1}
          </span>
          <span className="font-semibold text-sm text-slate-800 truncate">{proceso.proceso}</span>
        </div>
        <span className="text-xs text-slate-400 font-mono shrink-0">
          {done}/{proceso.actividades.length}
        </span>
      </div>
      <div className="space-y-1.5 mb-2">
        {proceso.actividades.map((a, i) => (
          <label key={i} className="flex items-start gap-2.5 text-sm py-1 cursor-pointer group">
            <button type="button" onClick={() => onToggle(i)} className="mt-0.5 shrink-0">
              {checks[i] ? (
                <CheckCircle2 size={18} style={{ color: BRAND.green }} />
              ) : (
                <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />
              )}
            </button>
            <span className={checks[i] ? "text-slate-500 line-through decoration-slate-300" : "text-slate-700"}>{a}</span>
          </label>
        ))}
      </div>
      <textarea
        value={obsLocal}
        onChange={(e) => setObsLocal(e.target.value)}
        onBlur={() => {
          if (obsLocal !== ((entry && entry.observaciones) || "")) onObsChange(obsLocal);
        }}
        placeholder="Observaciones (opcional)"
        rows={1}
        className="w-full text-xs border border-slate-100 bg-slate-50 rounded-lg px-2.5 py-2 mt-1 resize-none focus:ring-1 focus:ring-emerald-400 outline-none placeholder:text-slate-400"
      />
      {complete && entry && entry.fechaCompletado && (
        <p className="text-[11px] mt-2 font-medium" style={{ color: BRAND.green }}>
          ✓ Completado el {fmtDate(entry.fechaCompletado)}
          {entry.certificadoPor ? ` · ${entry.certificadoPor}` : ""}
        </p>
      )}
    </div>
  );
}

function SemanaHeader({ semana, procesos, cert }) {
  const completos = procesos.filter((p) => procesoCompleto(cert, p)).length;
  const total = procesos.length;
  const full = completos === total;
  const some = completos > 0 && !full;
  const bg = full ? BRAND.greenSoft : some ? "#FCF3E3" : "#F1F5F9";
  const fg = full ? BRAND.greenDark : some ? "#8A5A12" : "#475569";
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-3"
      style={{ backgroundColor: bg }}
    >
      <div className="flex items-center gap-2">
        {full && <CheckCircle2 size={18} style={{ color: fg }} />}
        <h3 className="text-base font-extrabold" style={{ color: fg, fontFamily: DISPLAY_FONT }}>
          {semana}
        </h3>
      </div>
      <span className="text-xs font-bold shrink-0" style={{ color: fg }}>
        {completos}/{total} procesos {full ? "· completa ✓" : ""}
      </span>
    </div>
  );
}

function FillCertView({ id, liderNombre, onBack, onIndexChange }) {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    storageGetCert(id).then((c) => {
      if (active) {
        setCert(c);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  const roleTpl = cert ? CERT_DATA.roles[cert.rol] : null;
  const { pct, estado } = cert && roleTpl ? computeStatus(cert, roleTpl) : { pct: 0, estado: "sin_iniciar" };

  async function persist(updatedCert) {
    const { pct: newPct, estado: newEstado } = computeStatus(updatedCert, CERT_DATA.roles[updatedCert.rol]);
    if (newEstado === "certificado" && !updatedCert.fechaCertificado) {
      updatedCert = { ...updatedCert, fechaCertificado: todayISO() };
    }
    setCert(updatedCert);
    await storageSetCert(updatedCert);
    const idx = await storageGetIndex();
    const i = idx.findIndex((x) => x.id === updatedCert.id);
    if (i >= 0) {
      idx[i] = {
        ...idx[i],
        estado: newEstado,
        pct: newPct,
        actualizadoEn: new Date().toISOString(),
        lider: updatedCert.lider || idx[i].lider,
        fechaCertificado: updatedCert.fechaCertificado || idx[i].fechaCertificado,
      };
      await storageSetIndex(idx);
      onIndexChange(idx);
    }
  }

  function toggleCheck(proceso, actIdx) {
    const prevEntry = (cert.checklist && cert.checklist[proceso.idx]) || {
      checks: Array(proceso.actividades.length).fill(false),
      observaciones: "",
      fechaCompletado: null,
      certificadoPor: "",
    };
    const checks = prevEntry.checks.length === proceso.actividades.length ? [...prevEntry.checks] : Array(proceso.actividades.length).fill(false);
    checks[actIdx] = !checks[actIdx];
    const allDone = checks.every(Boolean);
    const updatedEntry = { ...prevEntry, checks, certificadoPor: liderNombre, fechaCompletado: allDone ? todayISO() : null };
    const updatedCert = {
      ...cert,
      lider: cert.lider || liderNombre,
      checklist: { ...cert.checklist, [proceso.idx]: updatedEntry },
    };
    persist(updatedCert);
  }

  function updateObs(proceso, text) {
    const prevEntry = (cert.checklist && cert.checklist[proceso.idx]) || {
      checks: Array(proceso.actividades.length).fill(false),
      observaciones: "",
      fechaCompletado: null,
      certificadoPor: "",
    };
    const updatedEntry = { ...prevEntry, observaciones: text };
    const updatedCert = { ...cert, checklist: { ...cert.checklist, [proceso.idx]: updatedEntry } };
    persist(updatedCert);
  }

  if (loading) return <LoadingScreen />;
  if (!cert || !roleTpl)
    return (
      <EmptyState
        icon={Info}
        title="No disponible"
        subtitle="No se encontró esta certificación."
        action={
          <button onClick={onBack} className="text-sm font-semibold" style={{ color: BRAND.green }}>
            Volver
          </button>
        }
      />
    );

  const hasSemanas = roleTpl.procesos.some((p) => p.semana);
  let grupos;
  if (hasSemanas) {
    const acc = {};
    const orden = [];
    roleTpl.procesos.forEach((p) => {
      const key = p.semana || "Sin semana asignada";
      if (!acc[key]) {
        acc[key] = [];
        orden.push(key);
      }
      acc[key].push(p);
    });
    grupos = orden.map((k) => acc[k]);
  } else {
    grupos = [roleTpl.procesos];
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <TopBar
        title={cert.colaborador}
        subtitle={`${cert.rol} · ${cert.sucursal}`}
        onBack={onBack}
        right={<EstadoBadge estado={estado} pct={pct} />}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
          <RutaSemanas roleTpl={roleTpl} cert={cert} />
          <ProgressBar pct={pct} />
          <p className="text-xs text-slate-400 mt-2">
            {pct}% completado · {roleTpl.procesos.filter((p) => procesoCompleto(cert, p)).length} de {roleTpl.procesos.length} procesos
            certificados
          </p>
        </div>

        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-3.5 mb-5 text-xs text-amber-800">
          <Info size={15} className="shrink-0 mt-0.5" />
          <p>Revisa cada actividad junto al colaborador, deja que la practique y márcala solo cuando demuestre dominio real.</p>
        </div>

        {grupos.map((procesos, gi) => (
          <div key={gi} className="mb-8">
            {hasSemanas && <SemanaHeader semana={procesos[0].semana} procesos={procesos} cert={cert} />}
            <div className="space-y-3">
              {procesos.map((p) => (
                <ProcesoCard
                  key={p.idx}
                  proceso={p}
                  entry={cert.checklist ? cert.checklist[p.idx] : null}
                  onToggle={(i) => toggleCheck(p, i)}
                  onObsChange={(t) => updateObs(p, t)}
                />
              ))}
            </div>
            {hasSemanas && gi < grupos.length - 1 && (
              <div className="flex items-center gap-2 mt-5 px-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide shrink-0">
                  Fin de {procesos[0].semana} · sigue {grupos[gi + 1][0].semana}
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   COLABORADOR
   ============================================================ */
function ColaboradorPanel({ index, onBack, onIndexChange }) {
  const [nombre, setNombre] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  if (!confirmado) {
    return (
      <NameGate
        icon={UserCircle2}
        title="¿Cuál es tu nombre?"
        subtitle="Buscaremos tu certificación con este nombre."
        value={nombre}
        onChange={setNombre}
        onSubmit={() => setConfirmado(true)}
        onBack={onBack}
        placeholder="Tu nombre completo"
      />
    );
  }

  if (selectedId) {
    return <ColabCertView id={selectedId} onBack={() => setSelectedId(null)} onIndexChange={onIndexChange} />;
  }

  return (
    <ColabSearch index={index} nombre={nombre} onBack={onBack} onSelect={setSelectedId} onChangeName={() => setConfirmado(false)} />
  );
}

function ColabSearch({ index, nombre, onBack, onSelect, onChangeName }) {
  const matches = useMemo(() => {
    return index.filter((c) => matchesName(nombre, c.colaborador)).sort((a, b) => normaliza(a.colaborador).localeCompare(normaliza(b.colaborador)));
  }, [index, nombre]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar
        title="Tu certificación"
        subtitle={nombre}
        onBack={onBack}
        right={
          <button onClick={onChangeName} className="text-xs font-semibold text-slate-500 hover:text-slate-700 shrink-0">
            Cambiar
          </button>
        }
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {matches.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No encontramos tu certificación"
            subtitle="Verifica que tu nombre esté escrito igual que en el registro, o consulta con tu certificador."
          />
        ) : (
          <div className="space-y-2">
            {matches.map((c) => (
              <CertRow key={c.id} c={c} onClick={() => onSelect(c.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReflexionInput({ value, onSave }) {
  const [local, setLocal] = useState(value);
  return (
    <textarea
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        if (local !== value) onSave(local);
      }}
      rows={2}
      placeholder="Escribe tu respuesta…"
      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
    />
  );
}

function ColabCertView({ id, onBack, onIndexChange }) {
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("progreso");

  useEffect(() => {
    let active = true;
    storageGetCert(id).then((c) => {
      if (active) {
        setCert(c);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  const roleTpl = cert ? CERT_DATA.roles[cert.rol] : null;
  const { pct, estado } = cert && roleTpl ? computeStatus(cert, roleTpl) : { pct: 0, estado: "sin_iniciar" };

  async function persist(updated) {
    setCert(updated);
    await storageSetCert(updated);
  }

  function setConfianza(procesoIdx, value) {
    const updated = {
      ...cert,
      autoeval: {
        ...cert.autoeval,
        confianza: { ...((cert.autoeval && cert.autoeval.confianza) || {}), [procesoIdx]: value },
      },
    };
    persist(updated);
  }

  function setReflexion(key, text) {
    const updated = {
      ...cert,
      autoeval: {
        ...cert.autoeval,
        reflexion: { ...((cert.autoeval && cert.autoeval.reflexion) || {}), [key]: text },
      },
    };
    persist(updated);
  }

  if (loading) return <LoadingScreen />;
  if (!cert || !roleTpl) return <EmptyState icon={Info} title="No disponible" subtitle="No se encontró esta certificación." />;

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <TopBar
        title={cert.colaborador}
        subtitle={`${cert.rol} · ${cert.sucursal}`}
        onBack={onBack}
        right={<EstadoBadge estado={estado} pct={pct} />}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
          <RutaSemanas roleTpl={roleTpl} cert={cert} />
          <ProgressBar pct={pct} />
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5">
          <TabBtn active={tab === "progreso"} onClick={() => setTab("progreso")} icon={ClipboardList} label="Mi avance" />
          <TabBtn active={tab === "autoeval"} onClick={() => setTab("autoeval")} icon={MessageSquareText} label="Autoevaluación" />
        </div>

        {tab === "progreso" && <ChecklistReadOnly roleTpl={roleTpl} cert={cert} />}

        {tab === "autoeval" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 px-1 mb-1">
              Cuéntanos qué tan preparado te sientes en cada proceso. Esto ayuda a tu certificador y a GEB University a dar mejor
              seguimiento — no sustituye tu certificación con tu certificador.
            </p>
            {roleTpl.procesos.map((p) => (
              <div key={p.idx} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-800 mb-2">
                  {p.idx + 1}. {p.proceso}
                </p>
                <div className="flex flex-col gap-1.5">
                  {CONFIANZA_OPCIONES.map((o) => {
                    const checked = cert.autoeval && cert.autoeval.confianza && cert.autoeval.confianza[p.idx] === o.value;
                    return (
                      <label key={o.value} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name={`conf-${p.idx}`}
                          checked={!!checked}
                          onChange={() => setConfianza(p.idx, o.value)}
                        />
                        <span className={checked ? "font-semibold text-slate-800" : "text-slate-500"}>{o.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {roleTpl.autoevaluacion && roleTpl.autoevaluacion.length > 0 && (
              <>
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 pt-3 px-1">Preguntas de reflexión</h3>
                {roleTpl.autoevaluacion.map((sem) => (
                  <div key={sem.semana} className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-xs font-bold mb-3" style={{ color: BRAND.green }}>
                      {sem.semana}
                    </p>
                    <div className="space-y-4">
                      {sem.preguntas.map((q, qi) => {
                        const key = sem.semana + "__" + qi;
                        return (
                          <div key={qi}>
                            <p className="text-sm text-slate-700 mb-1.5">{q}</p>
                            <ReflexionInput
                              value={(cert.autoeval && cert.autoeval.reflexion && cert.autoeval.reflexion[key]) || ""}
                              onSave={(t) => setReflexion(key, t)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   APP RAIZ
   ============================================================ */
export default function App() {
  useFonts();
  const [view, setView] = useState("landing");
  const [index, setIndex] = useState([]);
  const [ready, setReady] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  useEffect(() => {
    (async () => {
      await loadCertData();
      const idx = await storageGetIndex();
      setIndex(idx);
      setReady(true);
    })();
  }, []);

  async function refreshIndex() {
    const idx = await storageGetIndex();
    setIndex(idx);
  }

  if (!ready) return <LoadingScreen />;

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', sans-serif" }} className="text-slate-900 min-h-screen">
      {view === "landing" && <Landing onSelect={setView} />}
      {view === "admin" && !adminUnlocked && (
        <AdminPasswordGate
          onSuccess={() => setAdminUnlocked(true)}
          onBack={() => setView("landing")}
        />
      )}
      {view === "admin" && adminUnlocked && (
        <AdminPanel
          index={index}
          onBack={() => {
            setAdminUnlocked(false);
            setView("landing");
          }}
          onRefresh={refreshIndex}
        />
      )}
      {view === "lider" && <LiderPanel index={index} onBack={() => setView("landing")} onIndexChange={setIndex} />}
      {view === "colaborador" && <ColaboradorPanel index={index} onBack={() => setView("landing")} onIndexChange={setIndex} />}
    </div>
  );
}
