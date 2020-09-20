import Vue from 'vue'

export default class ImageLoader
  constructor: (@loading) ->
    @images = {}

  load: (url) ->
    entry = @images[url]
    if entry
      if entry.loaded
        url
      else
        @loading
    else
      entry = { loaded: false }
      img = new Image
      img.onload = -> entry.loaded = true
      img.src = url
      Vue.set @images, url, entry # Make this reactive
      @loading
