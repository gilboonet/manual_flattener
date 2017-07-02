const jscad = require('@jscad/openjscad')
const fs = require('fs')

var script = `function main() {
   return [
      torus()
  ]
}`

// generate compiled version
var params = {}
jscad.compile(script, params).then(function(compiled) {
  // generate final output data, choosing your prefered format
  var outputData = jscad.generateOutput('stlb', compiled)
  // hurray ,we can now write an stl file from our OpenJsCad script!
  fs.writeFileSync('torus.stl', outputData.asBuffer())
})
