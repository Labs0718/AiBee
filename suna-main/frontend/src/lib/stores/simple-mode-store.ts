import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SimpleModeState {
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
  setSimpleMode: (isSimple: boolean) => void;
}

export const useSimpleModeStore = create<SimpleModeState>()(
  persist(
    (set) => ({
      isSimpleMode: false,
      toggleSimpleMode: () =>
        set((state) => ({ isSimpleMode: !state.isSimpleMode })),
      setSimpleMode: (isSimple: boolean) =>
        set({ isSimpleMode: isSimple }),
    }),
    {
      name: 'simple-mode-storage',
    }
  )
);