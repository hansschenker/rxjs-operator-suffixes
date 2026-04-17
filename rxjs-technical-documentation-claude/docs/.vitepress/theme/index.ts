import DefaultTheme from 'vitepress/theme'
import { type EnhanceAppContext } from 'vitepress'
import OperatorTree from './OperatorTree.vue'
import DebounceTimePlayground from './components/DebounceTimePlayground.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('OperatorTree', OperatorTree)
    app.component('DebounceTimePlayground', DebounceTimePlayground)
  },
}
