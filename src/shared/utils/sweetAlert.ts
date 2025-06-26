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
      "¡Layout Guardado!",
      "El layout se ha guardado correctamente y has cambiado al modo vista."
    ),

  navigationConfirm: () =>
    showInfo(
      "🎯 Layout Guardado",
      "Has salido del modo edición y se ha guardado el layout automáticamente. ¿Deseas continuar con la navegación?"
    ),

  clearStorageConfirm: () =>
    showWarning(
      "⚠️ ¿Estás seguro?",
      "Esto eliminará completamente todos los datos guardados y reiniciará el dashboard a valores por defecto."
    ),

  storageCleared: () =>
    showSuccess(
      "¡Limpiado!",
      "Los datos se han eliminado correctamente. La página se recargará."
    ),

  draggableExample: () =>
    showDraggable(
      "Drag me!",
      "¡Puedes arrastrar esta alerta por toda la pantalla!"
    ),
};

export default Swal;
