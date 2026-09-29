import { create } from "zustand";

interface UiState {
  commandOpen: boolean;
  sidebarOpen: boolean;
  hintVisible: boolean;
  toastVisible: boolean;
  errorMessage: unknown;
  setCommandOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setHintVisible: (visible: boolean) => void;
  setToastVisible: (visible: boolean) => void;
  showError: (message: unknown) => void;
  clearError: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  commandOpen: false,
  sidebarOpen: false,
  hintVisible: true,
  toastVisible: true,
  errorMessage: null,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setHintVisible: (hintVisible) => set({ hintVisible }),
  setToastVisible: (toastVisible) => set({ toastVisible }),
  showError: (errorMessage) => set({ errorMessage }),
  clearError: () => set({ errorMessage: null }),
}));
