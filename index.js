'use strict'

window.addEventListener('DOMContentLoaded', () => {
	const canvases = document.querySelectorAll('.particles')
	var particlesCanvases = []
	canvases.forEach(canvas => {
		particlesCanvases.push(new ParticlesCanvas(canvas))
	})
})

class ParticlesCanvas {

	constructor(canvas, options) {
		this.options = {
			autoInit: true,
			particlesLimit: 70,
			particlesSize: 2,
			particlesVelocityLimit: .5,
			particlesColor: '#eee',
			linesLenght: 130,
			linesColor: '255, 255, 255',
			...options
		}
		this.canvas = canvas
		this.ctx = this.canvas.getContext('2d')
		if(this.options.autoInit) {
			this.init()
			this.draw()
		}
	}

	init() {
		this.randomParticles = []
		for(let i = 0; i < this.options.particlesLimit; i++)
			this.randomParticles.push(new Particle({ xLimit: this.canvas.width, yLimit: this.canvas.height, velocityLimit: this.options.particlesVelocityLimit }))
	}

	draw = () => {
		window.requestAnimationFrame(this.draw)
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.randomParticles.forEach(particle => {
			this.drawParticle(particle)
			let closestParticles = this.randomParticles.filter(tested => this.particlesDistance(particle, tested) < this.options.linesLenght)
			closestParticles.forEach(closeParticle => {
				let distance = this.particlesDistance(particle, closeParticle)

				// const opacity = -1 / this.options.linesLenght * distance + 1
				const opacity = 0.5 * Math.cos(Math.PI * distance / this.options.linesLenght) + 0.5
				// const opacity = 1 / Math.PI * Math.acos(2 / this.options.linesLenght * distance - 1)
				this.ctx.strokeStyle = `rgba(${this.options.linesColor}, ${opacity})`
				this.ctx.lineWidth = this.options.particlesSize * opacity
				this.ctx.beginPath()
				this.ctx.moveTo(particle.x, particle.y)
				this.ctx.lineTo(closeParticle.x, closeParticle.y)
				this.ctx.stroke()
			})
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

}

class Particle {
	constructor(options) {
		this.options = {
			xLimit: 300,
			yLimit: 150,
			velocityLimit: .5,
			...options
		}

		const [ x, y ] = this.randomCoords()
		this.x = x
		this.y = y

		const [ velX, velY ] = this.randomVelocity()
		this.velX = velX
		this.velY = velY
	}

	requestNewPosition() {
		const [ newX, newY ] = [ this.x + this.velX, this.y + this.velY ]
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
		const negative = () => { 
			if(Math.random() > 0.5) return false 
			else return true
		}
		const randomNumber = () => Math.random() * this.options.velocityLimit
		return [
			negative() ? - randomNumber(): randomNumber(),
			negative() ? - randomNumber(): randomNumber()
		]
	}
}