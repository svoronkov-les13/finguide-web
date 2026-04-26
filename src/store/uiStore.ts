import { create } from "zustand";

interface UiState {
  commandOpen: boolean;
  sidebarOpen: boolean;
  hintVisible: boolean;
  toastVisible: boolean;
  setCommandOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setHintVisible: (visible: boolean) => void;
  setToastVisible: (visible: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  commandOpen: false,
  sidebarOpen: true,
  hintVisible: true,
  toastVisible: true,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setHintVisible: (hintVisible) => set({ hintVisible }),
  setToastVisible: (toastVisible) => set({ toastVisible }),
}));
