import gsap from 'gsap'
import E from '@unseenco/e'
import { Core } from '../../../src/taxi'
import DefaultRenderer from './renderers/DefaultRenderer'
import DefaultTransition from './transitions/DefaultTransition'

E.on('DOMContentLoaded', window, function () {
	const taxi = new Core({
		renderers: {
			default: DefaultRenderer
		},
		transitions: {
			default: DefaultTransition
		}
	})

	const navItems = document.querySelectorAll('.js-nav li')
	const menuToggle = document.querySelector('.js-menu-toggle')
	const menu = document.getElementById('main-menu')

	taxi.on('NAVIGATE_OUT', () => {
		navItems.forEach(el => {
			el.classList.remove('active')
		})

		// close menu if open
		menuToggle.setAttribute('aria-expanded', 'false')

		gsap.to(menu, { x: () => -menu.clientWidth })
			.then(() => {
				menu.classList.add('invisible')
			})
	})

	taxi.on('NAVIGATE_IN', ({ to }) => {
		window.scrollTo(0, 0)

		const next = to.page.querySelector('.js-nav li.active a')

		if (next) {
			navItems.forEach(el => {
				if (el.firstElementChild.href === next.href) {
					el.classList.add('active')
				}
			})
		}
	})

	if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
		document.documentElement.classList.add('dark')
	} else {
		document.documentElement.classList.remove('dark')
	}

	E.on('click', '.js-theme-toggle', () => {
		if (document.documentElement.classList.contains('dark')) {
			document.documentElement.classList.remove('dark')
			localStorage.setItem('theme', 'light')
		} else {
			document.documentElement.classList.add('dark')
			localStorage.setItem('theme', 'dark')
		}
	})

	// Mobile menu
	E.on('click', menuToggle, () => {
		const current = menuToggle.getAttribute('aria-expanded')

		if (current === 'false') {
			menuToggle.setAttribute('aria-expanded', 'true')
			menu.classList.remove('invisible')
			gsap.to(menu, { x: 0 })
		} else {
			menuToggle.setAttribute('aria-expanded', 'false')

			gsap.to(menu, { x: () => -menu.clientWidth })
				.then(() => {
					menu.classList.add('invisible')
				})
		}
	})

	//star count
	const starcount = document.querySelector('.js-stars')
	const version = document.querySelector('.js-version')

	fetch('https://api.github.com/repos/craftedbygc/taxi')
		.then((response) => response.json())
		.then((data) => {
			if (!data.message) {
				starcount.innerHTML = convertStars(data.stargazers_count)
			} else {
				throw new Error('GitHub API hates me')
			}
		})
		.catch((error) => {
			console.error('Error:', error);
			starcount.parentElement.remove()
		})

	fetch('https://registry.npmjs.org/@unseenco/taxi/latest')
		.then((response) => response.json())
		.then((data) => {
			if (data.version) {
				version.innerHTML = `v${data.version}`
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		})
})

function convertStars(amount) {
	return Math.abs(amount) > 999
		? Math.sign(amount) * (Math.abs(amount) / 1000).toFixed(1) + "k"
		: Math.sign(amount) * Math.abs(amount);
}
