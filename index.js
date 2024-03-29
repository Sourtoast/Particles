'use strict'

window.addEventListener('load', () => {
	const particleCanvasElement = document.querySelector('#particle-canvas')
	const particleCanvasObject = new ParticleCanvas(particleCanvasElement, {
		autoInit: false,
		particlesNumber: 100,
		linesLength: 200,
		mouseLinesLength: 300
	})
	particleCanvasObject.width = particleCanvasElement.parentElement.offsetWidth
	particleCanvasObject.height = particleCanvasElement.parentElement.offsetHeight
	particleCanvasObject.init()

	window.addEventListener('resize', () => {
		particleCanvasObject.width = particleCanvasElement.parentElement.offsetWidth
		particleCanvasObject.height = particleCanvasElement.parentElement.offsetHeight
	})

	// const canvases = document.querySelectorAll('.particles')
	// var ParticleCanvases = []
	// canvases.forEach(canvas => {
	// 	ParticleCanvases.push(new ParticleCanvas(canvas))
	// })
})

class ParticleCanvas {

	constructor(canvas, options) {
		this.options = {
			autoInit: true,
			particlesNumber: 50,
			particlesSize: 2,
			particlesVelocityLimit: 1,
			particlesColor: '#eee',
			linesLength: 120,
			mouseLinesLength: 290,
			linesColor: '255, 255, 255',
			...options
		}
		this.canvas = canvas
		this.ctx = this.canvas.getContext('2d')
		this.generatingParticles = false
		this.randomParticles = []
		if(this.options.autoInit)
			this.init()
	}

	get width() { return this.canvas.width }

	set width(width) {
		this.canvas.width = width
		this.generateRandomParticles()
	}

	get height() { return this.canvas.height }

	set height(height) {
		this.canvas.height = height
		this.generateRandomParticles()
	}

	init() {
		this.generateRandomParticles()
		this.canvas.addEventListener('mousemove', e => {
			this.mousePosition = this.getMousePos(e)
		})
		this.canvas.addEventListener('mouseout', e => this.mousePosition = false)
		this.canvas.addEventListener('mousedown', e => {
			const [x, y] = this.getMousePos(e)
			this.randomParticles.push(new Particle({
				x: x,
				y: y,
				xLimit: this.canvas.width,
				yLimit: this.canvas.height,
				velocityLimit: this.options.particlesVelocityLimit
			}))
		})
		this.draw()
	}

	draw = () => {
		window.requestAnimationFrame(this.draw)
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.randomParticles.forEach(particle => {
			this.drawParticle(particle)
			let closestParticles = this.randomParticles.filter(tested => this.particlesDistance(particle, tested) < this.options.linesLength)
			closestParticles.forEach(closeParticle => {
				let distance = this.particlesDistance(particle, closeParticle)
				// const opacity = -1 / this.options.linesLenght * distance + 1
				// const opacity = 0.5 * Math.cos(Math.PI * distance / this.options.linesLenght) + 0.5
				const opacity = 1 / Math.PI * Math.acos(2 / this.options.linesLength * distance - 1)
				this.ctx.strokeStyle = `rgba(${this.options.linesColor}, ${opacity})`
				this.ctx.lineWidth = this.options.particlesSize * opacity
				this.ctx.beginPath()
				this.ctx.moveTo(particle.x, particle.y)
				this.ctx.lineTo(closeParticle.x, closeParticle.y)
				this.ctx.stroke()
			})

			if(this.mousePosition) {
				const mouseDistance = this.particlesDistance(particle, { x: this.mousePosition[0], y: this.mousePosition[1] })
				if(mouseDistance < this.options.mouseLinesLength) {
					const opacity = 1 / Math.PI * Math.acos(2 / this.options.mouseLinesLength * mouseDistance - 1)
					this.ctx.strokeStyle = `rgba(${this.options.linesColor}, ${opacity})`
					this.ctx.lineWidth = this.options.particlesSize * opacity
					this.ctx.beginPath()
					this.ctx.moveTo(particle.x, particle.y)
					this.ctx.lineTo(this.mousePosition[0], this.mousePosition[1])
					this.ctx.stroke()
				}
			}

		})

	}

	drawParticle(particle) {
		this.ctx.beginPath()
		this.ctx.arc(particle.x, particle.y, this.options.particlesSize, 0, 2 * Math.PI)
		this.ctx.fillStyle = this.options.particlesColor
		this.ctx.fill()
		this.ctx.closePath()
		particle.requestNewPosition()
	}

	particlesDistance(partA, partB) {
		return Math.sqrt(Math.pow(partB.x - partA.x, 2) + Math.pow(partB.y - partA.y, 2))
	}

	getMousePos(ev) {
		var rect = this.canvas.getBoundingClientRect();
		return [
			ev.clientX - rect.left,
			ev.clientY - rect.top
		]
	}

	generateRandomParticles() {
		if(this.generatingParticles) return
		this.generatingParticles = true
		this.randomParticles = []
		setTimeout(() => {
			for(let i = 0; i < this.options.particlesNumber; i++)
				this.randomParticles.push(new Particle({ xLimit: this.width, yLimit: this.height, velocityLimit: this.options.particlesVelocityLimit }))
			this.generatingParticles = false
		}, 500)
	}

}

class Particle {
	constructor(options) {
		this.options = {
			xLimit: 300,
			yLimit: 150,
			velocityLimit: .5,
			...options
		}

		if(this.options.x && this.options.y) var { x, y } = this.options
		else var [x, y] = this.randomCoords()

		this.x = x
		this.y = y

		const [velX, velY] = this.randomVelocity()
		this.velX = velX
		this.velY = velY
	}

	requestNewPosition() {
		const [newX, newY] = [this.x + this.velX, this.y + this.velY]
		if(newX >= this.options.xLimit || newX <= 0)
			this.velX = - this.velX
		if(newY >= this.options.yLimit || newY <= 0)
			this.velY = - this.velY
		this.x = newX
		this.y = newY
	}

	randomCoords() {
		return [
			Math.floor(Math.random() * (this.options.xLimit - 10)),
			Math.floor(Math.random() * (this.options.yLimit - 10))
		]
	}

	randomVelocity() {
		const negative = () =>  Math.random() <= 0.5;
		const randomNumber = () => Math.random() * this.options.velocityLimit
		return [
			negative() ? - randomNumber() : randomNumber(),
			negative() ? - randomNumber() : randomNumber()
		]
	}
}