import { create } from "zustand";
/*
 * 지금 화면이 어떤 상태인가? 어떤 UI가 열려 있는가?
 *
 */
export const useUiStore = create((set) => ({
    isLoginModalOpen: false,

    openLoginModal: () => set({ isLoginModalOpen: true }),
    closeLoginModal: () => set({ isLoginModalOpen: false }),
}));
