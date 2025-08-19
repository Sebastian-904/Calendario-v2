
import type { LucideIcon } from 'lucide-react';
import { Home, Sidebar, Navigation, Calendar, ClipboardList, Building, FileText, Settings, UploadCloud, Image, Clock } from 'lucide-react';

type ContentBlock = 
    | { type: 'h2'; text: string }
    | { type: 'h3'; text: string }
    | { type: 'p'; text: string }
    | { type: 'list'; items: string[] };

export interface HelpTopic {
    id: string;
    title: string;
    icon: LucideIcon;
    content: ContentBlock[];
}

const consultantContent: HelpTopic[] = [
    {
        id: 'intro',
        title: 'Introducción y Panel Principal',
        icon: Home,
        content: [
            { type: 'h2', text: 'Bienvenido al Calendario de Cumplimiento Pro' },
            { type: 'p', text: 'Como Consultor, usted tiene un control casi total sobre las empresas y usuarios que gestiona. Esta guía le mostrará cómo utilizar todas las potentes funciones de la plataforma para garantizar que sus clientes se mantengan al día con sus obligaciones de cumplimiento.' },
            { type: 'h3', text: 'Vista General del Panel de Control' },
            { type: 'p', text: 'Al iniciar sesión, se le presentará el panel principal, que incluye:' },
            { type: 'list', items: [
                '<b>Encabezado Superior:</b> Aquí encontrará su avatar, nombre y rol, un reloj en tiempo real, opciones para cambiar el tema (claro/oscuro), el idioma, acceder a este centro de ayuda y cerrar sesión.',
                '<b>Tarjetas de Indicadores (KPIs):</b> Un resumen rápido de las tareas: Totales, Pendientes y Completadas.'
            ]}
        ]
    },
    {
        id: 'sidebar',
        title: 'Barra Lateral: Su Centro de Comando',
        icon: Sidebar,
        content: [
            { type: 'h2', text: 'Gestión desde la Barra Lateral' },
            { type: 'p', text: 'La barra lateral izquierda es donde realizará la mayor parte de su navegación y gestión de alto nivel.' },
            { type: 'h3', text: 'Gestión de Empresas' },
            { type: 'list', items: [
                '<b>Logotipo y Selección:</b> Verá el logotipo de la empresa actual. Utilice el menú desplegable para cambiar entre las diferentes empresas que administra.',
                '<b>Agregar Nueva Empresa:</b> Haga clic en el botón `Nuevo`. Tendrá la opción de crear una empresa manualmente o usar el potente <b>Asistente de Importación desde Excel</b>.',
                '<b>Editar Empresa Actual:</b> Haga clic en `Editar` para modificar los datos de la empresa seleccionada, incluyendo su <b>logotipo</b>.'
            ]},
            { type: 'h3', text: 'Gestión de Equipo' },
            { type: 'list', items: [
                '<b>Avatares de Equipo:</b> Cada miembro del equipo se muestra con su avatar para una fácil identificación.',
                '<b>Agregar Usuario:</b> Haga clic en el icono `+` para agregar un nuevo usuario. Puede asignar roles y un <b>avatar de perfil</b>.',
                '<b>Editar/Eliminar Usuario:</b> Pase el cursor sobre un usuario para ver los iconos de editar o eliminar.'
            ]}
        ]
    },
     {
        id: 'import-excel',
        title: 'Asistentes de Importación Excel',
        icon: UploadCloud,
        content: [
             { type: 'h2', text: 'Importación de Datos Simplificada' },
             { type: 'p', text: 'Hemos creado asistentes guiados para facilitar la carga masiva de datos, ahorrándole horas de trabajo manual.'},
             { type: 'h3', text: 'Crear una Empresa desde Excel' },
             { type: 'p', text: 'Al crear una nueva empresa, elija la opción "Importar desde Excel". El asistente le guiará a través de los siguientes pasos:'},
             { type: 'list', items: [
                 '<b>1. Subir Archivo:</b> Se recomienda descargar nuestra plantilla para asegurar que los datos estén bien estructurados.',
                 '<b>2. Mapear Datos:</b> Asigne las columnas de su Excel (ej. "Nombre Cliente", "Email") a los campos de la aplicación (ej. "User - Full Name", "User - Email").',
                 '<b>3. Validar:</b> El sistema revisa los datos en busca de errores (ej. emails incorrectos) y le permite corregirlos antes de importar.',
                 '<b>4. Resumen:</b> Confirme la importación final.'
             ]},
             { type: 'h3', text: 'Cargar Obligaciones desde Excel' },
             { type: 'p', text: 'Dentro del <b>Perfil de Empresa</b>, en la pestaña de <b>Obligaciones</b>, encontrará el botón "Subir Excel". Este asistente le permite cargar docenas de obligaciones de cumplimiento de una sola vez, siguiendo un proceso similar de mapeo y validación.'},
             { type: 'p', text: '<b>Nota importante:</b> El progreso en los asistentes se guarda automáticamente. Si cierra la ventana a mitad del proceso, puede continuar donde lo dejó la próxima vez.'}
        ]
    },
    {
        id: 'personalization',
        title: 'Logotipos y Avatares',
        icon: Image,
        content: [
             { type: 'h2', text: 'Personalización de la Marca' },
             { type: 'h3', text: 'Logotipos de Empresa' },
             { type: 'p', text: 'Al editar o crear una empresa, puede subir el logotipo de su cliente. Este logotipo aparecerá en la barra lateral y, lo que es más importante, en el encabezado de todos los <b>reportes en PDF</b>, dándoles un aspecto altamente profesional y personalizado.'},
             { type: 'h3', text: 'Avatares de Usuario' },
             { type: 'p', text: 'Al editar o crear un usuario, puede personalizar su perfil:'},
             { type: 'list', items: [
                '<b>Subir una foto:</b> Permite cargar un archivo de imagen personal.',
                '<b>Elegir un avatar:</b> Ofrecemos una galería de avatares predefinidos, al estilo Netflix, para una personalización rápida y sencilla.'
             ]}
        ]
    },
    {
        id: 'settings',
        title: 'Configuración y Preferencias',
        icon: Settings,
        content: [
            { type: 'h2', text: 'Ajuste la Aplicación a su Gusto' },
            { type: 'h3', text: 'Preferencias de Visualización' },
             { type: 'p', text: 'En la sección de Configuración, encontrará nuevas opciones para personalizar su experiencia:'},
            { type: 'list', items: [
                '<b>Formato de Hora:</b> Elija si desea que el reloj en el encabezado se muestre en formato de 12 horas (AM/PM) o 24 horas. Su preferencia se guardará en su navegador.'
            ]},
            { type: 'h3', text: 'Plantillas y Categorías' },
            { type: 'p', text: 'Cree categorías de tareas personalizadas con códigos de color y defina plantillas para las tareas más comunes, agilizando enormemente su flujo de trabajo.'}
        ]
    }
];

const clientContent: HelpTopic[] = [
    {
        id: 'intro',
        title: 'Introducción y Panel Principal',
        icon: Home,
        content: [
            { type: 'h2', text: 'Bienvenido al Calendario de Cumplimiento Pro' },
            { type: 'p', text: 'Como Cliente, esta plataforma le permite mantenerse informado sobre todas las obligaciones y tareas de cumplimiento gestionadas por su consultor.' },
            { type: 'h3', text: 'Vista General del Panel de Control' },
             { type: 'list', items: [
                '<b>Encabezado Superior:</b> Muestra su avatar, nombre y rol, un reloj en tiempo real, y opciones para cambiar el tema, el idioma, acceder a este manual y cerrar sesión.',
                '<b>Tarjetas de Indicadores (KPIs):</b> Ofrecen un resumen rápido de las tareas de su empresa: Totales, Pendientes y Completadas.'
            ]}
        ]
    },
    {
        id: 'sidebar',
        title: 'Barra Lateral y Navegación',
        icon: Sidebar,
        content: [
            { type: 'h2', text: 'Navegación en la Barra Lateral' },
            { type: 'h3', text: 'Información y Navegación' },
            { type: 'list', items: [
                '<b>Logotipo de la Empresa:</b> Verá el logotipo de su empresa, personalizando su espacio de trabajo.',
                '<b>Navegación Principal:</b> Contiene los enlaces a las secciones de Calendario, Tareas, Perfil de Empresa y Reportes.',
                '<b>Avatares de Equipo:</b> Vea los avatares de todos los miembros del equipo asignados a su empresa.'
            ]},
            { type: 'h3', text: 'Gestión de Equipo (Solo para Cliente Admin)' },
            { type: 'p', text: 'Si tiene el rol de "Cliente - Admin", puede agregar, editar o eliminar usuarios de su propia empresa desde la tarjeta de Equipo. También puede gestionar sus avatares.' },
        ]
    },
    {
        id: 'features',
        title: 'Funciones Principales',
        icon: ClipboardList,
        content: [
             { type: 'h2', text: 'Funciones Principales' },
             { type: 'h3', text: 'Calendario y Tareas' },
             { type: 'p', text: 'Consulte todas las tareas programadas en una vista de calendario o de lista. Si es administrador, puede crear nuevas tareas, editar las existentes y marcarlas como completadas.' },
             { type: 'h3', text: 'Perfil de Empresa' },
             { type: 'p', text: 'Consulte toda la información legal, fiscal y operativa de su empresa. Si es administrador, puede editar esta información. Recuerde siempre guardar los cambios.' },
             { type: 'h3', text: 'Reportes' },
             { type: 'p', text: 'Genere y descargue informes en PDF. Los reportes incluirán el <b>logotipo de su empresa</b>, dándoles un aspecto oficial.' },
        ]
    }
];


export const helpContent: Record<'consultor' | 'client', HelpTopic[]> = {
    consultor: consultantContent,
    client: clientContent,
};
