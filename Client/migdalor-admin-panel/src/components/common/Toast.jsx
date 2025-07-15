import React, { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// You will need to add this to your project's main stylesheet or index.html
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />

const MySwal = withReactContent(Swal);

/**
 * A React component that displays a SweetAlert2 toast notification when shown.
 * @param {object} props - The component props.
 * @param {boolean} props.show - Controls the visibility of the toast.
 * @param {'success' | 'error' | 'warning' | 'info'} [props.variant='info'] - The type of toast to display.
 * @param {string} props.message - The message to show in the toast.
 * @param {() => void} props.onClose - Callback function that is called when the toast is closed.
 */
const Toast = ({ show, variant = "info", message, onClose }) => {
  useEffect(() => {
    if (show) {
      // Base configuration for all toasts
      const baseConfig = {
        position: "top",
        toast: true,
        showConfirmButton: false,
        showClass: {
          popup: "animate__animated animate__zoomIn animate__faster",
        },
        hideClass: {
          popup: "animate__animated animate__zoomOut animate__faster",
        },
        didClose: () => {
          if (onClose) {
            onClose();
          }
        },
      };

      let config;

      // Customize the configuration based on the variant prop
      switch (variant) {
        case "success":
          config = {
            ...baseConfig,
            icon: "success",
            title: message,
            timer: 1500,
          };
          break;
        case "error":
          config = {
            ...baseConfig,
            icon: "error",
            title: message,
            timer: 2500,
          };
          break;
        case "warning":
          config = {
            ...baseConfig,
            icon: "warning",
            title: message,
            timer: 2500,
          };
          break;
        case "info":
        default:
          config = {
            ...baseConfig,
            title: `<div class="text-center h5">${message}</div>`,
            timer: 1500,
          };
          break;
      }

      // Fire the toast
      MySwal.fire(config);
    }
  }, [show, variant, message, onClose]);

  // This component does not render anything to the DOM itself
  return null;
};

export default Toast;
