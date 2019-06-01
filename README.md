# flipbook-vue

`flipbook-vue` is a Vue component that displays images in 3D page flip effect.

Demo page is [here](https://ts1.github.io/flipbook-vue/).

## Installation

Install as a package.

```
npm i -S flipbook-vue
```

or

```
yarn add flipbook-vue
```

Or include in html.

```html
<script src="https://unpkg.com/flipbook-vue"></script>
```

## Usage

```html
<template>
  <flipbook class="flipbook" :pages="['array', 'of', 'image', 'URLs']"></flipbook>
</template>

<style>
.flipbook {
  width: 100%;
  height: 100%;
}
</style>
```


If installed as package,

```html
<script>
import Flipbook from 'flipbook-vue'
export default {
  components: { Flipbook }
}
</script>
```

If you would like to build from `.vue` directly (including CoffeeScript transpile, etc),

```javascript
import Flipbook from 'flipbook-vue/sfc'
```

or

```javascript
import Flipbook from 'flipbook-vue/src/Flipbook.vue'
```

## Props

### `pages`

Array of image URLs. Required.
All images should have the same aspect ratio.

If the first element is `null`, the next element is displayed as the cover page.

All other props are optional.

### `pagesHiRes`

Array of high resolution version of image URLs.
They are used when zoomed.

### `flipDuration`

Duration of page flipping animation in milliseconds.
Defaults to 1000.

### `zoomDuration`

Duration of zoom in/out animation in milliseconds.
Defaults to 500.

### `zooms`

Array of possible magnifications. 
Defaults to `[1, 2, 4]`.

### `ambient`

Intensity of ambient light in 0 to 1.
Smaller value gives more shades.
Defaults to 0.4.

### `gloss`

Intensity of specular light in 0 to 1.
Higher value gives more gloss.
Defaults to 0.6.

## Slot props

This component exposes some properties and methods as slot properties.
Example usage:

```html
<flipbook :pages="pages" v-slot="flipbook">
  <button @click="flipbook.flipLeft">Previous Page</button>
  <button @click="flipbook.flipRight">Next Page</button>
</flipbook>
```

For more practical usage, refer to [`src/App.vue`](https://github.com/ts1/flipbook-vue/blob/master/src/App.vue) (the demo page source).

### `canFlipLeft`

True if it can flip to previous page. 

### `canFlipRight`

True if it can flip to next page. 

### `canZoomIn`

True if it can zoom in.

### `canZoomOut`

True if it can zoom out.

### `flipLeft`

Method to flip to previous page.

### `flipRight`

Method to flip to next page.

### `zoomIn`

Method to zoom in.

### `zoomOut`

Method to zoom out.

## CSS API

You have to specify the size of view port in your style sheet, directly to
`<flipbook>` element.

If the size is horizontally long, it displays two pages spread, suitable for desktop browsers.
If it's vertically long, it displays single pages, suitable for smartphones.

There are some internal classes.

### `.bounding-box`

Approximate bounding box of the displayed images.
Suitable to give `box-shadow`.

## Browser support

Supports modern browsers and IE 11.

## License

MIT

Copyright © 2019 Takeshi Sone.
