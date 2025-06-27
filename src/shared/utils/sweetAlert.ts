import Swal from "sweetalert2";

const baseConfig = {
  customClass: {
    popup: "rounded-lg shadow-xl",
    title: "text-lg font-semibold text-gray-900",
    content: "text-gray-600",
    confirmButton: "px-4 py-2 rounded-lg font-medium transition-colors",
    cancelButton: "px-4 py-2 rounded-lg font-medium transition-colors",
  },
  buttonsStyling: false,
  showClass: {
    popup: "animate__animated animate__fadeInDown animate__faster",
  },
  hideClass: {
    popup: "animate__animated animate__fadeOutUp animate__faster",
  },
};

export const SweetAlertConfig = {
  success: (title: string, text?: string) => ({
    ...baseConfig,
    title,
    text,
    icon: "success" as const,
    confirmButtonColor: "#10b981",
    confirmButtonText: "Perfecto",
    timer: 3000,
    timerProgressBar: true,
  }),

  error: (title: string, text?: string) => ({
    ...baseConfig,
    title,
    text,
    icon: "error" as const,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Entendido",
  }),

  warning: (title: string, text: string) => ({
    ...baseConfig,
    title,
    text,
    icon: "warning" as const,
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    focusCancel: true,
  }),

  info: (title: string, text: string) => ({
    ...baseConfig,
    title,
    text,
    icon: "info" as const,
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Quedarme aquí",
    reverseButtons: true,
    focusConfirm: true,
  }),

  question: (title: string, text: string) => ({
    ...baseConfig,
    title,
    text,
    icon: "question" as const,
    showCancelButton: true,
    confirmButtonColor: "#8b5cf6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Sí",
    cancelButtonText: "No",
    reverseButtons: true,
  }),

  draggable: (title: string, text?: string) => ({
    ...baseConfig,
    title,
    text,
    icon: "success" as const,
    draggable: true,
    confirmButtonColor: "#10b981",
    confirmButtonText: "Genial!",
    showClass: {
      popup: "animate__animated animate__bounceIn",
    },
    hideClass: {
      popup: "animate__animated animate__bounceOut",
    },
  }),
};

export const showSuccess = (title: string, text?: string) => {
  return Swal.fire(SweetAlertConfig.success(title, text));
};

export const showError = (title: string, text?: string) => {
  return Swal.fire(SweetAlertConfig.error(title, text));
};

export const showWarning = (title: string, text: string) => {
  return Swal.fire(SweetAlertConfig.warning(title, text));
};

export const showInfo = (title: string, text: string) => {
  return Swal.fire(SweetAlertConfig.info(title, text));
};

export const showQuestion = (title: string, text: string) => {
  return Swal.fire(SweetAlertConfig.question(title, text));
};

export const showDraggable = (title: string, text?: string) => {
  return Swal.fire(SweetAlertConfig.draggable(title, text));
};

export const ProjectAlerts = {
  layoutSaved: () =>
    showSuccess(
      "Layout Guardado",
      "La configuración de widgets se ha guardado correctamente"
    ),

  navigationConfirm: () =>
    Swal.fire({
      title: "¿Cambiar de página?",
      text: "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
      ...baseConfig,
    }),

  clearStorageConfirm: () =>
    Swal.fire({
      title: "¿Limpiar almacenamiento?",
      text: "Esto eliminará todas las configuraciones guardadas. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, limpiar",
      cancelButtonText: "Cancelar",
      ...baseConfig,
    }),

  storageCleared: () =>
    showSuccess(
      "Almacenamiento limpiado",
      "Todas las configuraciones han sido eliminadas"
    ),

  confirm: (
    title: string,
    text: string,
    confirmText: string = "Confirmar",
    cancelText: string = "Cancelar"
  ) =>
    Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      ...baseConfig,
    }),

  success: (title: string, text?: string) =>
    Swal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText: "OK",
      ...baseConfig,
    }),

  draggableExample: () =>
    showDraggable(
      "Ejemplo Draggable",
      "Este es un ejemplo de SweetAlert2 draggable"
    ),
};

export default Swal;
