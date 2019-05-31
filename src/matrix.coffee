import { identity, multiply, translate, translateZ, rotateY } from 'rematrix'

export default class Matrix
  constructor: (arg) ->
    if arg
      if Array.isArray(arg)
        @m = arg
      else
        @m = [arg.m...]
    else
      @m = identity()

  multiply: (m) ->
    m = m.m  unless Array.isArray m
    @m = multiply @m, m

  computeX: -> @m[12]

  translate: (x, y) -> @multiply translate x, y
  translateZ: (z) -> @multiply translateZ z
  rotateY: (deg) -> @multiply rotateY deg
  toString: -> "matrix3d(#{@m.toString()})"
