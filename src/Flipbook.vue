<template>
  <div>
    <slot v-bind="{
      canFlipLeft,
      canFlipRight,
      canZoomIn,
      canZoomOut,
      page,
      numPages,
      flipLeft,
      flipRight,
      zoomIn,
      zoomOut
    }" />
    <div
      class="viewport"
      ref="viewport"
      :class="{
        zoom: zooming || zoom > 1,
        'drag-to-scroll': dragToScroll
      }"
      :style="{ cursor: cursor == 'grabbing' ? 'grabbing' : 'auto' }"
      @touchmove="onTouchMove"
      @pointermove="onPointerMove"
      @mousemove="onMouseMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @mouseup="onMouseUp"
      @wheel="onWheel"
    >
      <div class="container" :style="{ transform: `scale(${zoom})`, }">
        <div
          class="click-to-flip left"
          :style="{ cursor: canFlipLeft ? 'pointer' : 'auto'}"
          @click="flipLeft"
        />
        <div
          class="click-to-flip right"
          :style="{ cursor: canFlipRight ? 'pointer' : 'auto'}"
          @click="flipRight"
        />
        <div :style="{ transform: `translateX(${centerOffsetSmoothed}px)` }">
          <img
            class="page fixed"
            :style="{
              width: pageWidth + 'px',
              height: pageHeight + 'px',
              left: xMargin + 'px',
              top: yMargin + 'px'
            }"
            :src="pageUrl(leftPage, true)"
            v-if="showLeftPage"
            @load="didLoadImage($event)"
          />
          <img
            class="page fixed"
            :style="{
              width: pageWidth + 'px',
              height: pageHeight + 'px',
              left: viewWidth / 2 + 'px',
              top: yMargin + 'px'
            }"
            v-if="showRightPage"
            :src="pageUrl(rightPage, true)"
            @load="didLoadImage($event)"
          />

          <div :style="{ opacity: flip.opacity }">
            <div
              v-for="[
                key,
                bgImage,
                lighting,
                bgPos,
                transform,
                z
              ] in polygonArray"
              class="polygon"
              :key="key"
              :class="{ blank: !bgImage }"
              :style="{
                backgroundImage: bgImage,
                backgroundSize: polygonBgSize,
                backgroundPosition: bgPos,
                width: polygonWidth,
                height: polygonHeight,
                transform: transform,
                zIndex: z,
              }"
            >
              <div
                class="lighting"
                v-show="lighting.length"
                :style="{ backgroundImage: lighting }"
              />
            </div>
          </div>
          <div
            class="bounding-box"
            :style="{
              left: boundingLeft + 'px',
              top: yMargin + 'px',
              width: boundingRight - boundingLeft + 'px',
              height: pageHeight + 'px',
              cursor: cursor
            }"
            @touchstart="onTouchStart"
            @pointerdown="onPointerDown"
            @mousedown="onMouseDown"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="coffee">
import Matrix from './matrix'

easeIn = (x) -> Math.pow(x, 2)
easeOut = (x) -> 1 - easeIn(1 - x)
easeInOut = (x) ->
  if (x < 0.5) then easeIn(x * 2) / 2 else 0.5 + easeOut((x - 0.5) * 2) / 2

IE = /Trident/.test navigator.userAgent

export default
  props:
    pages:
      type: Array
      required: true
    pagesHiRes:
      type: Array
      default: -> []
    flipDuration:
      type: Number
      default: 1000
    zoomDuration:
      type: Number
      default: 500
    zooms:
      type: Array
      default: -> [1, 2, 4]
    perspective:
      type: Number
      default: 2400
    nPolygons:
      type: Number
      default: 10
    ambient:
      type: Number
      default: 0.4
    gloss:
      type: Number
      default: 0.6
    swipeMin:
      type: Number
      default: 3
    singlePage:
      type: Boolean
      default: false
    forwardDirection:
      validator: (val) -> val == 'right' or val == 'left'
      default: 'right'
    centering:
      type: Boolean
      default: true
    startPage:
      type: Number
      default: null

  data: ->
    viewWidth: 0
    viewHeight: 0
    imageWidth: null
    imageHeight: null
    displayedPages: 1
    nImageLoad: 0
    nImageLoadTrigger: 0
    imageLoadCallback: null
    currentPage: 0
    firstPage: 0
    secondPage: 1
    zoomIndex: 0
    zoom: 1
    zooming: false
    touchStartX: null
    touchStartY: null
    maxMove: 0
    activeCursor: null
    hasTouchEvents: false
    hasPointerEvents: false
    minX: Infinity
    maxX: -Infinity
    preloadedImages: {}
    flip:
      progress: 0
      direction: null
      frontImage: null
      backImage: null
      auto: false
      opacity: 1
    currentCenterOffset: null
    animatingCenter: false
    startScrollLeft: 0
    startScrollTop: 0
    scrollLeft: 0
    scrollTop: 0

  computed:
    canFlipLeft: ->
      if @forwardDirection == 'left' then @canGoForward else @canGoBack
    canFlipRight: ->
      if @forwardDirection == 'right' then @canGoForward else @canGoBack
    canZoomIn: -> not @zooming and @zoomIndex < @zooms_.length - 1
    canZoomOut: -> not @zooming and @zoomIndex > 0
    numPages: -> if @pages[0] == null then @pages.length - 1 else @pages.length
    page: ->
      if @pages[0] != null
        @currentPage + 1
      else
        Math.max 1, @currentPage

    zooms_: -> @zooms or [1]

    canGoForward: ->
      not @flip.direction and @currentPage < @pages.length - @displayedPages
    canGoBack: ->
      not @flip.direction and @currentPage >= @displayedPages and
        not (@displayedPages == 1 and not @pageUrl(@firstPage - 1))
    leftPage: ->
      if @forwardDirection == 'right' or @displayedPages == 1
        @firstPage
      else
        @secondPage
    rightPage: ->
      if @forwardDirection == 'left' then @firstPage else @secondPage
    showLeftPage: ->
      @pageUrl(@leftPage)
    showRightPage: ->
      @pageUrl(@rightPage) and @displayedPages == 2

    cursor: ->
      if @activeCursor
        @activeCursor
      else if IE
        'auto'
      else if @canZoomIn
        'zoom-in'
      else if @canZoomOut
        'zoom-out'
      else
        'grab'

    pageScale: ->
      vw = @viewWidth / @displayedPages
      xScale = vw / @imageWidth
      yScale = @viewHeight / @imageHeight
      scale = if xScale < yScale then xScale else yScale
      if scale < 1 then scale else 1
    pageWidth: -> Math.round(@imageWidth * @pageScale)
    pageHeight: -> Math.round(@imageHeight * @pageScale)
    xMargin: -> (@viewWidth - @pageWidth * @displayedPages) / 2
    yMargin: -> (@viewHeight - @pageHeight) / 2
    polygonWidth: ->
      w = @pageWidth / @nPolygons
      w = Math.ceil(w + 1 / @zoom)
      w + 'px'
    polygonHeight: -> @pageHeight + 'px'
    polygonBgSize: -> "#{@pageWidth}px #{@pageHeight}px"
    polygonArray: ->
      @makePolygonArray('front').concat(@makePolygonArray('back'))
    boundingLeft: ->
      if @displayedPages == 1
        @xMargin
      else
        x =
          if @pageUrl(@leftPage)
            @xMargin
          else
            @viewWidth / 2
        if x < @minX then x else @minX
    boundingRight: ->
      if @displayedPages == 1
        @viewWidth - @xMargin
      else
        x =
          if @pageUrl(@rightPage)
            @viewWidth - @xMargin
          else
            @viewWidth / 2
        if x > @maxX then x else @maxX
    centerOffset: ->
      retval =
        if @centering
          Math.round(@viewWidth / 2 - (@boundingLeft + @boundingRight) / 2)
        else
          0
      if @currentCenterOffset == null and @imageWidth != null
        @currentCenterOffset = retval
      retval

    centerOffsetSmoothed: -> Math.round(@currentCenterOffset)

    dragToScroll: -> not @hasTouchEvents

    scrollLeftMin: ->
      w = (@boundingRight - @boundingLeft) * @zoom
      if w < @viewWidth
        (@boundingLeft + @centerOffsetSmoothed) * @zoom - (@viewWidth - w) / 2
      else
        (@boundingLeft + @centerOffsetSmoothed) * @zoom

    scrollLeftMax: ->
      w = (@boundingRight - @boundingLeft) * @zoom
      if w < @viewWidth
        (@boundingLeft + @centerOffsetSmoothed) * @zoom - (@viewWidth - w) / 2
      else
        (@boundingRight + @centerOffsetSmoothed)* @zoom - @viewWidth

    scrollTopMin: ->
      h = @pageHeight * @zoom
      if h < @viewHeight
        @yMargin * @zoom - (@viewHeight - h) / 2
      else
        @yMargin * @zoom

    scrollTopMax: ->
      h = @pageHeight * @zoom
      if h < @viewHeight
        @yMargin * @zoom - (@viewHeight - h) / 2
      else
        (@yMargin + @pageHeight) * @zoom - @viewHeight

    scrollLeftLimited: ->
      Math.min(@scrollLeftMax, Math.max(@scrollLeftMin, @scrollLeft))

    scrollTopLimited: ->
      Math.min(@scrollTopMax, Math.max(@scrollTopMin, @scrollTop))

  mounted: ->
    window.addEventListener 'resize',  @onResize, passive: true
    @onResize()
    @preloadImages()
    @zoom = @zooms_[0]
    @goToPage @startPage

  beforeDestroy: ->
    window.removeEventListener 'resize',  @onResize, passive: true

  methods:
    onResize: ->
      viewport = @$refs.viewport
      return unless viewport
      @viewWidth = viewport.clientWidth
      @viewHeight = viewport.clientHeight
      @displayedPages =
        if @viewWidth > @viewHeight and not @singlePage then 2 else 1
      @currentPage &= ~1 if @displayedPages == 2
      @fixFirstPage()
      @minX = Infinity
      @maxX = -Infinity

    fixFirstPage: ->
      @currentPage++ if @displayedPages == 1 and
        @currentPage == 0 and
        @pages.length and
        not @pageUrl(0)

    pageUrl: (page, hiRes = false) ->
      if hiRes and @zoom > 1 and not @zooming
        url = @pagesHiRes[page]
        return url if url
      @pages[page] or null

    flipLeft: ->
      return unless @canFlipLeft
      @flipStart 'left', true

    flipRight: ->
      return unless @canFlipRight
      @flipStart 'right', true

    makePolygonArray: (face) ->
      return [] unless @flip.direction

      progress = @flip.progress
      direction = @flip.direction

      if @displayedPages == 1 and direction != @forwardDirection
        progress = 1 - progress
        direction = @forwardDirection

      @flip.opacity =
        if @displayedPages == 1 and progress > .7
          1 - (progress - .7) / .3
        else
          1

      image = if face == 'front' then @flip.frontImage else @flip.backImage
      bgImg = image && "url('#{image}')"

      polygonWidth = @pageWidth / @nPolygons

      pageX = @xMargin
      originRight = false
      if @displayedPages == 1
        if @forwardDirection == 'right'
          if face == 'back'
            originRight = true
            pageX = @xMargin - @pageWidth
        else
          if direction == 'left'
            if face == 'back'
              pageX = @pageWidth - @xMargin
            else
              originRight = true
          else
            if face == 'front'
              pageX = @pageWidth - @xMargin
            else
              originRight = true
      else
        if direction == 'left'
          if face == 'back'
            pageX = @viewWidth / 2
          else
            originRight = true
        else
          if face == 'front'
            pageX = @viewWidth / 2
          else
            originRight = true

      pageMatrix = new Matrix
      pageMatrix.translate @viewWidth / 2
      pageMatrix.perspective @perspective
      pageMatrix.translate -@viewWidth / 2
      pageMatrix.translate pageX, @yMargin

      pageRotation = 0
      if progress > 0.5
        pageRotation = -(progress - 0.5) * 2 * 180
      if direction == 'left'
        pageRotation = -pageRotation
      pageRotation += 180 if face == 'back'

      if pageRotation
        pageMatrix.translate @pageWidth if originRight
        pageMatrix.rotateY pageRotation
        pageMatrix.translate -@pageWidth if originRight

      if progress < 0.5
        theta = progress * 2 * Math.PI
      else
        theta = (1 - (progress - 0.5) * 2) * Math.PI
      if theta == 0
        theta = 1e-9
      radius = @pageWidth / theta

      radian = 0
      dRadian = theta / @nPolygons
      rotate = dRadian / 2 / Math.PI * 180
      dRotate = dRadian / Math.PI * 180

      if originRight
        rotate = -theta / Math.PI * 180 + dRotate / 2

      if face == 'back'
        rotate = -rotate
        dRotate = -dRotate

      @minX = Infinity
      @maxX = -Infinity
      for i in [0...@nPolygons]
        bgPos = "#{i / (@nPolygons - 1) * 100}% 0px"

        m = pageMatrix.clone()
        rad = if originRight then theta - radian else radian
        x = Math.sin(rad) * radius
        x = @pageWidth - x if originRight
        z = (1 - Math.cos(rad)) * radius
        z = -z if face == 'back'

        m.translate3d x, 0, z
        m.rotateY -rotate

        x0 = m.transformX 0
        x1 = m.transformX polygonWidth
        @maxX = Math.max Math.max(x0, x1), @maxX
        @minX = Math.min Math.min(x0, x1), @minX

        lighting = @computeLighting(pageRotation - rotate, dRotate)

        radian += dRadian
        rotate += dRotate
        [face+i, bgImg, lighting, bgPos, m.toString(), Math.abs(Math.round(z))]

    computeLighting: (rot, dRotate) ->
      gradients = []
      lightingPoints = [-0.5, -0.25, 0, 0.25, 0.5]
      if @ambient < 1
        blackness = 1 - @ambient
        diffuse = lightingPoints.map (d) =>
          (1 - Math.cos((rot - dRotate * d) / 180 * Math.PI)) * blackness
        gradients.push """
          linear-gradient(to right,
            rgba(0, 0, 0, #{diffuse[0]}),
            rgba(0, 0, 0, #{diffuse[1]}) 25%,
            rgba(0, 0, 0, #{diffuse[2]}) 50%,
            rgba(0, 0, 0, #{diffuse[3]}) 75%,
            rgba(0, 0, 0, #{diffuse[4]}))
          """

      if @gloss > 0 and not IE
        DEG = 30
        POW = 200
        specular = lightingPoints.map (d) =>
          Math.max(
            Math.cos((rot + DEG - dRotate * d) / 180 * Math.PI) ** POW,
            Math.cos((rot - DEG - dRotate * d) / 180 * Math.PI) ** POW
          )
        gradients.push """
          linear-gradient(to right,
            rgba(255, 255, 255, #{specular[0] * @gloss}),
            rgba(255, 255, 255, #{specular[1] * @gloss}) 25%,
            rgba(255, 255, 255, #{specular[2] * @gloss}) 50%,
            rgba(255, 255, 255, #{specular[3] * @gloss}) 75%,
            rgba(255, 255, 255, #{specular[4] * @gloss}))
          """
      gradients.join(',')

    flipStart: (direction, auto) ->
      if direction != @forwardDirection
        if @displayedPages == 1
          @flip.frontImage = @pageUrl(@currentPage - 1)
          @flip.backImage = null
        else
          @flip.frontImage = @pageUrl(@firstPage)
          @flip.backImage = @pageUrl(@currentPage - @displayedPages + 1)
      else
        if @displayedPages == 1
          @flip.frontImage = @pageUrl(@currentPage)
          @flip.backImage = null
        else
          @flip.frontImage = @pageUrl(@secondPage)
          @flip.backImage = @pageUrl(@currentPage + @displayedPages)

      @flip.direction = direction
      @flip.progress = 0
      requestAnimationFrame => requestAnimationFrame =>
        if @flip.direction != @forwardDirection
          if @displayedPages == 2
            @firstPage = @currentPage - @displayedPages
        else
          if @displayedPages == 1
            @firstPage = @currentPage + @displayedPages
          else
            @secondPage = @currentPage + 1 + @displayedPages
        @flipAuto(true) if auto

    flipAuto: (ease) ->
      t0 = Date.now()
      duration = @flipDuration * (1 - @flip.progress)
      startRatio = @flip.progress
      @flip.auto = true
      @$emit "flip-#{@flip.direction}-start", @page
      animate = => requestAnimationFrame =>
        t = Date.now() - t0
        ratio = startRatio + t / duration
        ratio = 1 if ratio > 1
        @flip.progress = if ease then easeInOut ratio else ratio
        if ratio < 1
          animate()
        else
          if @flip.direction != @forwardDirection
            @currentPage -= @displayedPages
          else
            @currentPage += @displayedPages
          @$emit "flip-#{@flip.direction}-end", @page
          if @displayedPages == 1 and @flip.direction == @forwardDirection
            @flip.direction = null
          else
            @onImageLoad 1, => @flip.direction = null
          @flip.auto = false
      animate()

    flipRevert: ->
      t0 = Date.now()
      duration = @flipDuration * @flip.progress
      startRatio = @flip.progress
      @flip.auto = true
      animate = => requestAnimationFrame =>
        t = Date.now() - t0
        ratio = startRatio - startRatio * t / duration
        ratio = 0 if ratio < 0
        @flip.progress = ratio
        if ratio > 0
          animate()
        else
          @firstPage = @currentPage
          @secondPage = @currentPage + 1
          if @displayedPages == 1 and @flip.direction != @forwardDirection
            @flip.direction = null
          else
            @onImageLoad 1, => @flip.direction = null
          @flip.auto = false
      animate()

    onImageLoad: (trigger, cb) ->
      @nImageLoad = 0
      @nImageLoadTrigger = trigger
      @imageLoadCallback = cb

    didLoadImage: (ev) ->
      if @imageWidth == null
        @imageWidth = (ev.target or ev.path[0]).naturalWidth
        @imageHeight = (ev.target or ev.path[0]).naturalHeight
      return unless @imageLoadCallback
      if ++@nImageLoad >= @nImageLoadTrigger
        @imageLoadCallback()
        @imageLoadCallback = null

    zoomIn: ->
      return unless @canZoomIn
      @zoomIndex += 1
      @zoomTo @zooms_[@zoomIndex]

    zoomOut: ->
      return unless @canZoomOut
      @zoomIndex -= 1
      @zoomTo @zooms_[@zoomIndex]

    zoomTo: (zoom, fixedX, fixedY) ->
      start = @zoom
      end = zoom
      viewport = @$refs.viewport
      startX = viewport.scrollLeft
      startY = viewport.scrollTop
      fixedX or= viewport.clientWidth / 2
      fixedY or= viewport.clientHeight / 2
      containerFixedX = fixedX + startX
      containerFixedY = fixedY + startY
      endX = containerFixedX / start * end - fixedX
      endY = containerFixedY / start * end - fixedY

      t0 = Date.now()
      @zooming = true
      @$emit 'zoom-start', zoom
      animate = => requestAnimationFrame =>
        t = Date.now() - t0
        ratio = t / @zoomDuration
        ratio = 1 if ratio > 1 or IE
        ratio = easeInOut(ratio)
        @zoom = start + (end - start) * ratio
        @scrollLeft = startX + (endX - startX) * ratio
        @scrollTop = startY + (endY - startY) * ratio
        if t < @zoomDuration
          animate()
        else
          @$emit 'zoom-end', zoom
          @zooming = false
          @zoom = zoom
          @scrollLeft = endX
          @scrollTop = endY
      animate()
      if end > 1
        @preloadImages true

    zoomAt: (touch) ->
      rect = @$refs.viewport.getBoundingClientRect()
      x = touch.pageX - rect.left
      y = touch.pageY - rect.top
      @zoomIndex = (@zoomIndex + 1) % @zooms_.length
      @zoomTo @zooms_[@zoomIndex], x, y

    swipeStart: (touch) ->
      @touchStartX = touch.pageX
      @touchStartY = touch.pageY
      @maxMove = 0
      if @zoom <= 1
        @activeCursor = 'grab'
      else
        @startScrollLeft = @$refs.viewport.scrollLeft
        @startScrollTop = @$refs.viewport.scrollTop
        @activeCursor = 'all-scroll'

    swipeMove: (touch) ->
      return unless @touchStartX?
      x = touch.pageX - @touchStartX
      y = touch.pageY - @touchStartY
      @maxMove = Math.max(@maxMove, Math.abs(x))
      @maxMove = Math.max(@maxMove, Math.abs(y))
      if @zoom > 1
        @dragScroll x, y if @dragToScroll
        return
      return if Math.abs(y) > Math.abs(x)
      @activeCursor = 'grabbing'
      if x > 0
        if @flip.direction == null and @canFlipLeft and x >= @swipeMin
          @flipStart 'left', false
        if @flip.direction == 'left'
          @flip.progress = x / @pageWidth
          @flip.progress = 1 if @flip.progress > 1
      else
        if @flip.direction == null && @canFlipRight and x <= -@swipeMin
          @flipStart 'right', false
        if @flip.direction == 'right'
          @flip.progress = -x / @pageWidth
          @flip.progress = 1 if @flip.progress > 1
      true

    swipeEnd: (touch) ->
      return unless @touchStartX?
      @zoomAt touch if @maxMove < @swipeMin
      if @flip.direction != null and not @flip.auto
        if @flip.progress > 1/4
          @flipAuto(false)
        else
          @flipRevert()
      @touchStartX = null
      @activeCursor = null

    onTouchStart: (ev) ->
      @hasTouchEvents = true
      @swipeStart ev.changedTouches[0]
    onTouchMove: (ev) ->
      if @swipeMove ev.changedTouches[0]
        ev.preventDefault() if ev.cancelable
    onTouchEnd: (ev) -> @swipeEnd ev.changedTouches[0]

    onPointerDown: (ev) ->
      @hasPointerEvents = true
      return if @hasTouchEvents
      return if ev.which and ev.which != 1 # Ignore right-click
      @swipeStart ev
      try
        ev.target.setPointerCapture ev.pointerId
      catch

    onPointerMove: (ev) -> @swipeMove ev unless @hasTouchEvents

    onPointerUp: (ev) ->
      return if @hasTouchEvents
      @swipeEnd ev
      try
        ev.target.releasePointerCapture ev.pointerId
      catch

    onMouseDown: (ev) ->
      return if @hasTouchEvents or @hasPointerEvents
      return if ev.which and ev.which != 1 # Ignore right-click
      @swipeStart ev
    onMouseMove: (ev) ->
      @swipeMove ev unless @hasTouchEvents or @hasPointerEvents
    onMouseUp: (ev) ->
      @swipeEnd ev unless @hasTouchEvents or @hasPointerEvents

    dragScroll: (x, y) ->
      @scrollLeft = @startScrollLeft - x
      @scrollTop = @startScrollTop - y

    onWheel: (ev) ->
      if @zoom > 1 and @dragToScroll
        @scrollLeft = @$refs.viewport.scrollLeft + ev.deltaX
        @scrollTop = @$refs.viewport.scrollTop + ev.deltaY
        ev.preventDefault() if ev.cancelable

    preloadImages: (hiRes = false) ->
      if Object.keys(@preloadedImages).length >= 10
        @preloadedImages = {}
      for i in [@currentPage - 3 .. @currentPage + 3]
        url = @pageUrl i
        if url
          unless @preloadedImages[url]
            img = new Image()
            img.src = url
            @preloadedImages[url] = img
      if hiRes
        for i in [@currentPage ... @currentPage + @displayedPages]
          url = @pagesHiRes[i]
          if url
            unless @preloadedImages[url]
              img = new Image()
              img.src = url
              @preloadedImages[url] = img
      return

    goToPage: (p) ->
      return if p == null or p == @page
      if @pages[0] == null
        if @displayedPages == 2 and p == 1
          @currentPage = 0
        else
          @currentPage = p
      else
        @currentPage = p - 1
      @minX = Infinity
      @maxX = -Infinity
      @currentCenterOffset = @centerOffset

  watch:
    currentPage: ->
      @firstPage = @currentPage
      @secondPage = @currentPage + 1
      @preloadImages()

    centerOffset: ->
      return if @animatingCenter
      animate = => requestAnimationFrame =>
        rate = 0.1
        diff = @centerOffset - @currentCenterOffset
        if Math.abs(diff) < 0.5
          @currentCenterOffset = @centerOffset
          @animatingCenter = false
        else
          @currentCenterOffset += diff * rate
          animate()
      @animatingCenter = true
      animate()

    scrollLeftLimited: (val) ->
      if IE
        requestAnimationFrame => @$refs.viewport.scrollLeft = val
      else
        @$refs.viewport.scrollLeft = val

    scrollTopLimited: (val) ->
      if IE
        requestAnimationFrame => @$refs.viewport.scrollTop = val
      else
        @$refs.viewport.scrollTop = val

    pages: (after, before) ->
      @fixFirstPage()
      if not before?.length and after?.length
        if @startPage > 1 and after[0] == null
          @currentPage++

    startPage: (p) -> @goToPage p
</script>

<style scoped>
.viewport {
  -webkit-overflow-scrolling: touch;
  width: 100%;
  height: 100%;
}

.viewport.zoom {
  overflow: scroll;
}

.viewport.zoom.drag-to-scroll {
  overflow: hidden;
}

.container {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: top left;
  user-select: none;
}

.click-to-flip {
  position: absolute;
  width: 50%;
  height: 100%;
  top: 0;
  user-select: none;
}

.click-to-flip.left {
  left: 0;
}

.click-to-flip.right {
  right: 0;
}

.bounding-box {
  position: absolute;
  user-select: none;
}

.page {
  position: absolute;
  backface-visibility: hidden;
}

.polygon {
  position: absolute;
  top: 0;
  left: 0;
  background-repeat: no-repeat;
  backface-visibility: hidden;
  transform-origin: center left;
}

.polygon.blank {
  background-color: #ddd;
}

.polygon .lighting {
  width: 100%;
  height: 100%;
}
</style>
