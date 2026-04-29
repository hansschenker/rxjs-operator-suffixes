// src/main.ts
import './style.css'
import { state$, action$ } from './state/tree.state'
import { renderSidebar } from './ui/sidebar'
import { renderPanel } from './ui/panel'

const sidebar = document.getElementById('sidebar')!
const panel   = document.getElementById('panel')!
const navReset = document.getElementById('nav-reset')!

state$.subscribe(state => {
	renderSidebar(sidebar, state)
	renderPanel(panel, state)
})

navReset.addEventListener('click', e => {
	e.preventDefault()
	action$.next({ kind: 'reset' })
})
