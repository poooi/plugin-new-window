const { config } = window
export default {
  windowURL: `file://${__dirname}/index.html`,
  windowOptions: {
    x: config.get('poi.window.x', 0),
    y: config.get('poi.window.y', 0),
    width: 1100,
    height: 700,
    enableLargerThanScreen: true,
    titleBarStyle: 'hidden',
  },
  realClose: true,
  multiWindow: true,
}
