import { identity, multiply, translate, rotateY, toString } from 'rematrix'

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

  perspective: (d) -> @multiply [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, -1/d,
    0, 0, 0, 1
  ]

  transformX: (x) -> (x * @m[0] + @m[12]) / (x * @m[3] + @m[15])

  translate: (x, y) -> @multiply translate x, y

  translate3d: (x, y, z) ->
    m = translate x, y
    m[14] = z
    @multiply m

  rotateY: (deg) -> @multiply rotateY deg

  toString: -> toString @m
