'use strict'

if (process.env.NODE_ENV === 'production') {

} else {
    module.exports = require('./dist/tiny-vue.cjs.js')
}