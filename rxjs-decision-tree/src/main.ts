// src/main.ts
import './style.css'
import { action$, sidebarState$, panelState$ } from './state/tree.state'
import { renderSidebar } from './ui/sidebar'
import { renderPanel } from './ui/panel'

const sidebar  = document.getElementById('sidebar')!
const panel    = document.getElementById('panel')!
const navReset = document.getElementById('nav-reset')!

sidebarState$.subscribe(state => renderSidebar(sidebar, state))
panelState$.subscribe(state => renderPanel(panel, state))

navReset.addEventListener('click', e => {
	e.preventDefault()
	action$.next({ kind: 'reset' })
})
