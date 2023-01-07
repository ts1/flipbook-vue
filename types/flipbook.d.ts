import Vue from 'vue'
export type Direction = 'left' | 'right'
export type Face = 'front' | 'back'

export interface ZoomAt {
  pageX: number
  pageY: number
}

export type ImageLoadCallback = () => unknown
export interface SlotScope {
  canFlipLeft: boolean
  canFlipRight: boolean
  canZoomIn: boolean
  canZoomOut: boolean
  page: number
  numPages: number
  flipLeft(): void
  flipRight(): void
  zoomIn(zoomAt?: ZoomAt): void
  zoomOut(zoomAt?: ZoomAt): void
}
declare const component: Vue.DefineComponent<
  {
    pages: string[]
    pagesHiRes?: string[]
    flipDuration?: number
    zoomDuration?: number
    zooms?: number[]
    perspective?: number
    nPolygons?: number
    ambient?: number
    gloss?: number
    swipeMin?: number
    singlePage?: boolean
    forwardDirection?: 'left' | 'right'
    centering?: boolean
    startPage?: number
    loadingImage?: string
    clickToZoom?: boolean
    dragToFlip?: boolean
    wheel?: 'scroll' | 'zoom'
  },
  {},
  {},
  Vue.ComputedOptions,
  {
    onResize(): number | undefined
    fixFirstPage(): number | undefined
    pageUrl(page: number): string | null
    pageUrlLoading(page: number, hiRes?: boolean): string | null
    flipLeft(): number
    flipRight(): number
    makePolygonArray(face: Face): [id: string, image: string, lighting: string, bgPos: string, matrix: string, z: number][]
    computeLighting(rotate: number, dRotate: number): string
    flipStart(direction: Direction): number
    flipAuto(ease: boolean): number
    flipRevert(): number
    onImageLoad(trigger: number, cb: ImageLoadCallback): ImageLoadCallback
    didLoadImage(ev: Event): undefined | null
    zoomIn(zoomAt?: ZoomAt): number
    zoomOut(zoomAt?: ZoomZt): number
    zoomTo(zoom: number, zoomAt?: ZoomAt): number
    zoomAt(touch: ZoomAt): number
    swipeStart(touch: TouchInit): 'grab' | 'all-scroll'
    swipeMove(touch: TouchInit): true | undefined
    swipeEnd(touch: TouchInit): null | undefined
    onTouchStart(ev: TouchEvent): 'grab' | 'all-scroll'
    onTouchMove(ev: TouchEvent): void
    onTouchEnd(ev: TouchEvent): null | undefined
    onPointerDown(ev: PointerEvent): 'grab' | 'all-scroll'
    onPointerMove(ev: PointerEvent): true | undefined
    onPointerUp(ev: PointerEvent): void
    onMouseDown(ev: MouseEvent): 'grab' | 'all-scroll'
    onMouseMove(ev: MouseEvent): true | undefined
    onMouseUp(ev: MouseEvent): void
    dragScroll(x: number, y: number): number
    onWheel(ev: WheelEvent): void
    preloadImages(hiRes?: boolean): void
    goToPage(page: number): number
    loadImage(url: string): string
  },
  Vue.ComponentOptionsMixin,
  Vue.ComponentOptionsMixin,
  {
    'zoom-start': (zoom: number) => void
    'zoom-end': (zoom: number) => void
    'flip-left-start': (page: number) => void
    'flip-left-end': (page: number) => void
    'flip-right-start': (page: number) => void
    'flip-right-end': (page: number) => void
  }
>
export default component
