{% load static %}
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')
const lifeEl = document.querySelector('#lifeEl')

canvas.width = innerWidth
canvas.height = innerHeight

class Boundary {
    static width = 40
    static height = 40
    constructor({position, image}) { // 클래스 초기화 함수. {} 식으로 쓰면 매개변수 순서에 신경쓸 필요 없음!
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    draw() {
        //c.fillStyle = 'blue'
        //c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.drawImage(this.image, this.position.x, this.position.y)
    }

}

class Player {
    constructor({position, velocity}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)

        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if (this.radians < 0 || this.radians > .75) {
            this.openRate = -this.openRate
        }
        this.radians += this.openRate
    }
}

class Ghost {
    static speed = 2
    constructor({position, velocity, color = 'red'}) {
        this.position = position
        this.velocity = velocity
        this.radius = 15
        this.color = color
        this.prevCollisions = []
        this.speed = 2
        this.scared = false
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}


class Pellet {
    constructor({position}) {
        this.position = position
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }

}

class PowerUp {
    constructor({position}) {
        this.position = position
        this.radius = 7
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }

}

const pellets = []
const boundaries = []
const powerUps = []
const ghosts = []

function resetGhost() {
  ghosts.splice(0, ghosts.length)
  ghosts.push(new Ghost({position : {
    x:Boundary.width * 6 + Boundary.width / 2,
    y:Boundary.height + Boundary.height / 2
  }, velocity : {
      x:Ghost.speed,
      y:0
  },
  }))
  ghosts.push(new Ghost({position : {
    x:Boundary.width * 6 + Boundary.width / 2,
    y:Boundary.height * 4 + Boundary.height / 2
  }, velocity : {
    x:0,
    y:Ghost.speed
  }, color : 'pink'
  }))
  ghosts.push( new Ghost({position : {
    x:Boundary.width * 4 + Boundary.width / 2,
    y:Boundary.height * 8 + Boundary.height / 2
  }, velocity : {
    x:Ghost.speed,
    y:0
  }, color : 'green'
  }))
}

resetGhost()
const player = new Player({position : {x:Boundary.width + Boundary.width / 2, y:Boundary.height + Boundary.height / 2}, velocity:{x:0, y:0}})

function resetPlayer() {
  player.position = {x:Boundary.width + Boundary.width / 2, y:Boundary.height + Boundary.height / 2}
  player.velocity = {x:0, y:0}
  player.radians = 0.75
  player.openRate = 0.12
  player.rotation = 0
}

function resetMap() {
  map.forEach((row, i) => {
    row.forEach((symbol, j) => {
      switch (symbol) {
        case '.':
          pellets.push(
            new Pellet({
              position: {
                x: j * Boundary.width + Boundary.width / 2,
                y: i * Boundary.height + Boundary.height / 2
              }
            })
          )
          break
          case 'p':
            powerUps.push(
              new PowerUp({
                position: {
                  x: j * Boundary.width + Boundary.width / 2,
                  y: i * Boundary.height + Boundary.height / 2
                }
              })
            )
      }
    }
    )
  }
  )
}

function resetInfo() {
  life = 3
  lifeEl.innerHTML = life
  score = 0
  scoreEl.innerHTML = score
}

function resetPressedKey() {
  keys.w.pressed = false
  keys.a.pressed = false
  keys.s.pressed = false
  keys.d.pressed = false
}

const keys = {
    w: {
        pressed : false
    },
    a: {
        pressed : false
    },
    s: {
        pressed : false
    },
    d: {
        pressed : false
    }
}

let lastKey = ''
let score = 0
let life = 3

const map = [
  ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
  ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]


function createImage(src) {
  const image = new Image()
  image.src = src
  return image
}

var pic = '{% static "img/pipeHorizontal.png" %}'

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case '-':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage(pic)
          })
        )
        break
        /*
      case '|':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('D:/Python/Newbie_Project/static/img/pipeVertical.png')
          })
        )
        break

      case '1':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('D:/Python/Newbie_Project/static/img/pipeCorner1.png')
          })
        )
        break
      case '2':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('D:/Python/Newbie_Project/static/img/pipeCorner2.png')
          })
        )
        break
      case '3':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('D:/Python/Newbie_Project/static/img/pipeCorner3.png')
          })
        )
        break
      case '4':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('D:/Python/Newbie_Project/static/img/pipeCorner4.png')
          })
        )
        break
      case 'b':
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i
            },
            image: createImage('D:/Python/Newbie_Project/static/img/block.png')
          })
        )
        break
      case '[':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('D:/Python/Newbie_Project/static/img/capLeft.png')
          })
        )
        break
      case ']':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('D:/Python/Newbie_Project/static/img/capRight.png')
          })
        )
        break
      case '_':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('D:/Python/Newbie_Project/static/img/capBottom.png')
          })
        )
        break
      case '^':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('D:/Python/Newbie_Project/static/img/capTop.png')
          })
        )
        break
      case '+':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('D:/Python/Newbie_Project/static/img/pipeCross.png')
          })
        )
        break
      case '5':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('D:/Python/Newbie_Project/static/img/pipeConnectorTop.png')
          })
        )
        break
      case '6':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('D:/Python/Newbie_Project/static/img/pipeConnectorRight.png')
          })
        )
        break
      case '7':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            color: 'blue',
            image: createImage('D:/Python/Newbie_Project/static/img/pipeConnectorBottom.png')
          })
        )
        break
      case '8':
        boundaries.push(
          new Boundary({
            position: {
              x: j * Boundary.width,
              y: i * Boundary.height
            },
            image: createImage('D:/Python/Newbie_Project/static/img/pipeConnectorLeft.png')
          })
        )
        break
      case '.':
        pellets.push(
          new Pellet({
            position: {
              x: j * Boundary.width + Boundary.width / 2,
              y: i * Boundary.height + Boundary.height / 2
            }
          })
        )
        break
      case 'p' :
          powerUps.push(new PowerUp({position: {
                x: j * Boundary.width + Boundary.width / 2,
                  y: i * Boundary.height + Boundary.height / 2
                }
              })
            )
            */
          }
  })
}
)

function circleCollidesWithRectangle({circle, rectangle}) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding
        && circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding
        && circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding
        && circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding)
}

let animationId

function animate() {
    animationId = requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height) // 매 프레임마다 그림을 다시 그림

    // 입력된 키값에 따라 방향 조절
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRectangle({circle : {...player, velocity : {x:0, y:-5}}, rectangle : boundary}))  {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = -5
            }
        }
    } else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRectangle({circle : {...player, velocity : {x:-5, y:0}}, rectangle : boundary}))  {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = -5
            }
        }
    } else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRectangle({circle : {...player, velocity : {x:0, y:5}}, rectangle : boundary}))  {
                player.velocity.y = 0
                break
            } else {
                player.velocity.y = 5
            }
        }
    } else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (circleCollidesWithRectangle({circle : {...player, velocity : {x:5, y:0}}, rectangle : boundary}))  {
                player.velocity.x = 0
                break
            } else {
                player.velocity.x = 5
            }
        }
    }

    // detect collision btw ghosts and player
    for (let i = ghosts.length -1; 0 <= i; i--){
        const ghost = ghosts[i]
        if (Math.hypot(ghost.position.x - player.position.x, ghost.position.y - player.position.y
            ) < ghost.radius + player.radius)  {
                if (ghost.scared) {
                    ghosts.splice(i, 1)
                    score += 100
                    scoreEl.innerHTML = score
                } else {
                  if (life > 1) { // 목숨 감소 및 팩맨, 유령 초기화
                    cancelAnimationFrame(animationId)
                    console.log('Lost a Life!')
                    life -= 1
                    lifeEl.innerHTML = life
                    setTimeout(() => {
                      resetPlayer()
                      resetGhost()
                      console.log(player.velocity, ghosts[0].speed, ghosts[0].velocity)
                      animationId = requestAnimationFrame(animate)
                  }, 300)
                }
                  else { // 게임 오버 및 새게임 시작(전부 초기화)
                    cancelAnimationFrame(animationId)
                    console.log('Game Over!')
                    setTimeout(() => {
                      resetInfo()
                      resetPlayer()
                      resetGhost()
                      resetMap()
                      animationId = requestAnimationFrame(animate)
                    }, 1000)
                  }
                }
        }
    }

    // win condition
    if (pellets.length === 0) {
        cancelAnimationFrame(animationId)
        console.log('You Win!')
        setTimeout(() => {
          resetInfo()
          resetPlayer()
          resetGhost()
          resetMap()
          animationId = requestAnimationFrame(animate)
        }, 1000)
    }

    // 파워 쿠키 먹었을 때
    for (let i = powerUps.length -1; 0 <= i; i--){
        const powerUp = powerUps[i]
        powerUp.draw()

        if (Math.hypot(powerUp.position.x - player.position.x, powerUp.position.y - player.position.y
            ) < powerUp.radius + player.radius) {
                powerUps.splice(i, 1)

                ghosts.forEach(ghost => { // 유령 scared 모드로 전환
                    ghost.scared = true
                    setTimeout(() => {
                        ghost.scared = false
                    }, 5000)
                })
            }
    }

    for (let i = pellets.length -1; 0 <= i; i--){ // 깜빡거리지 않게 하기 위해 루프를 반대로 돌며 쿠키 그림
        const pellet = pellets[i]
        pellet.draw()

        if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y
            ) < pellet.radius + player.radius) {
                pellets.splice(i, 1)
                score += 10
                scoreEl.innerHTML = score
            }
    }

    // 막다른 길
    boundaries.forEach((boundary) => {
        boundary.draw()

        if (circleCollidesWithRectangle({circle : player, rectangle : boundary})) {
            player.velocity.x = 0
            player.velocity.y = 0
        }
    })

    player.update()
    // player.velocity.x = 0  // => 키가 눌려있지 않을 때 이동을 멈추려면
    // player.velocity.y = 0

    // 유령 방향 전환
    ghosts.forEach((ghost => {
        ghost.update()

        const collisions = []
        boundaries.forEach(boundary => {
            if (!collisions.includes('right') && circleCollidesWithRectangle({circle : {...ghost, velocity : {x:ghost.speed, y:0}}, rectangle : boundary})) {
                collisions.push('right')
            }

            if (!collisions.includes('left') && circleCollidesWithRectangle({circle : {...ghost, velocity : {x:-ghost.speed, y:0}}, rectangle : boundary})) {
                collisions.push('left')
            }

            if (!collisions.includes('up') && circleCollidesWithRectangle({circle : {...ghost, velocity : {x:0, y:-ghost.speed}}, rectangle : boundary})) {
                collisions.push('up')
            }

            if (!collisions.includes('down') && circleCollidesWithRectangle({circle : {...ghost, velocity : {x:0, y:ghost.speed}}, rectangle : boundary})) {
                collisions.push('down')
            }
        })

        if (collisions.length > ghost.prevCollisions.length) // 유령의 첫 움직임을 제외하고 받기 위한 부분
            ghost.prevCollisions = collisions

        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {

            if (ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if (ghost.velocity.y < 0) ghost.prevCollisions.push('up')
            else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down')

            const pathways = ghost.prevCollisions.filter(collision => {
                    return !collisions.includes(collision)
                })

            // 열린 방향 중 아무 곳을 랜덤으로 지정해서 이동
            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch (direction) {
                case 'down' :
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'up' :
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'right' :
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break
                case 'left' :
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                    break
            }

            ghost.prevCollisions = []
        }
    }))

    if (player.velocity.x > 0) player.rotation = 0
    else if (player.velocity.x < 0) player.rotation = Math.PI
    else if (player.velocity.y > 0) player.rotation = Math.PI / 2
    else if (player.velocity.y < 0) player.rotation = Math.PI * 1.5
}

animate()

addEventListener('keydown', ({key}) => {
  switch (key) {
      case 'w':
          keys.w.pressed = true
          lastKey = 'w'
          break
      case 'a':
          keys.a.pressed = true
          lastKey = 'a'
          break
      case 's':
          keys.s.pressed = true
          lastKey = 's'
          break
      case 'd':
          keys.d.pressed = true
          lastKey = 'd'
          break
  }
})


addEventListener('keyup', ({key}) => {
  switch (key) {
      case 'w':
          keys.w.pressed = false
          break
      case 'a':
          keys.a.pressed = false
          break
      case 's':
          keys.s.pressed = false
          break
      case 'd':
          keys.d.pressed = false
          break
  }
})