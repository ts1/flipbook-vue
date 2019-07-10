import {
  identity
  multiply
  perspective
  translate
  translate3d
  rotateY
  toString
} from 'rematrix'

export default class Matrix
  constructor: (arg) ->
    if arg
      if arg.m
        @m = [arg.m...]
      else
        @m = [arg...]
    else
      @m = identity()

  clone: -> new Matrix @

  multiply: (m) -> @m = multiply @m, m

  perspective: (d) -> @multiply perspective d

  transformX: (x) -> (x * @m[0] + @m[12]) / (x * @m[3] + @m[15])

  translate: (x, y) -> @multiply translate x, y

  translate3d: (x, y, z) -> @multiply translate3d x, y, z

  rotateY: (deg) -> @multiply rotateY deg

  toString: -> toString @m
