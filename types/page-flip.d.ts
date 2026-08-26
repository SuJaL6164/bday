declare module 'page-flip' {
  export class PageFlip {
    constructor(element: HTMLElement, setting: any);
    loadFromImages(images: string[]): void;
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    updateFromImages(images: string[]): void;
    destroy(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    flip(pageIndex: number): void;
    flipNext(): void;
    flipPrev(): void;
  }
}
