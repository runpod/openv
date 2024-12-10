import { create } from "zustand";

export type GridView = "2x2" | "4x4" | "list";

interface ViewState {
	gridView: GridView;
	setGridView: (view: GridView) => void;
}

export const useViewStore = create<ViewState>(set => ({
	gridView: "2x2",
	setGridView: view => set({ gridView: view }),
}));
