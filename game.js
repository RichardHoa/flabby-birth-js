// SELECT CVS
const cvs = document.getElementById("myCanvas");
const ctx = cvs.getContext("2d");

// GAME VARS AND CONSTS
let frames = 0;
const DEGREE = Math.PI / 180;

const point_sound = new Audio();
point_sound.src = "audio/sfx_point.wav";

const die_sound = new Audio();
die_sound.src = "audio/sfx_die.wav";

const flap_sound = new Audio();
flap_sound.src = "audio/sfx_flap.wav";

const hit_sound = new Audio();
hit_sound.src = "audio/sfx_hit.wav";

const swooshing_sound = new Audio();
swooshing_sound.src = "audio/sfx_swooshing.wav";


//Use state to control the game
const state = {
    current: 0,
    start: 0,
    game: 1,
    over: 2,
}

const StartButton = {
     x : 120,
     y: 263,
     w:83,
     h:29,

}

cvs.addEventListener('click',function(event) {
    switch(state.current) {
        case state.start:
            state.current = state.game;
            swooshing_sound.play();
            break;
        case state.game:
            bird.flap();
            flap_sound.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = event.clientX - rect.left;
            let clickY = event.clientY - rect.top;

            if (clickX >= StartButton.x && clickX <= StartButton.x + StartButton.w && clickY >= StartButton.y && clickY <= StartButton.y + StartButton.h)
            {
                console.log("reset score to 0")
                pipes.reset();
                bird.speedReset();
                Score.value = 0;
                state.current = state.start;
            }

            break;
    }
})
// DRAW
function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
}


const sprite = new Image();
sprite.src = "img/sprite.png"

const backGround = {
    sX : 0,
    sY : 0,
    w: 275,
    h: 226,
    x: 0,
    y: cvs.height - 226,

    draw : function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
}

const foreGround = {
    sX : 276,
    sY : 0,
    w: 224,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    dx : 1,

    draw : function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },

    update : function(){
        if( state.current == state.game)
        {
            this.x = (this.x - this.dx) % (this.w/4);
        }

    }
}

const bird = {
    animation: [
        {sY: 112},
        {sY: 139},
        {sY: 164},
        {sY: 139},
    ],
    sX: 276,
    x: 50,
    y: 150,
    w: 34,
    h: 26,
    gravity: 0.25,
    jump: 4,
    speed: 0,
    frame: 0,
    rotation: 0,
    radius: 12,
    
    update : function(){

        this.period = state.current == state.start ? 10 : 5;

        this.frame += frames % this.period == 0 ? 1 : 0;

        this.frame = this.frame % this.animation.length;

        if (state.current == state.start)
        {
            this.rotation = 0 * DEGREE;
            this.y = 150;
            this.speed = 0;
        }
        else {
            this.speed += this.gravity;
            this.y += this.speed;

            if(this.y + this.h/2 >= cvs.height - foreGround.h)
            {
                this.y = cvs.height - foreGround.h;
                this.frame = 1;
                if (state.current == state.game)
                {
                    die_sound.play();
                    state.current = state.over;
                }

            }
            if (this.speed >= this.jump ) {
                this.rotation = 90 * DEGREE;
            }
            else {
                this.rotation = -25 * DEGREE;
            }
        }
    },

    draw : function () {

        
        let bird = this.animation[this.frame]
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, this.sX, bird.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        ctx.restore();
    },

    flap : function(){
        this.speed = - this.jump;


    },

    speedReset : function() {
        speed = 0;
    }



}

const pipes = {
    position : [],

    top : {
        sX: 553,
        sY: 0,
    },
    
    bottom : {
        sX: 502,
        sY: 0,
    },

    w: 53,
    h: 400,
    gap: 90,
    MaxYPos: -150,
    dx: 4,


    draw : function() {
        for (let i=0 ; i < this.position.length ; i++) {
            let p = this.position[i];

            let top_yPosition = p.y;
            let bottom_yPosition = p.y + this.h + this.gap;

            //Top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, top_yPosition, this.w, this.h);

            //Bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottom_yPosition, this.w, this.h);

        }
    },

    update : function() {
        if( state.current != state.game) return;

        if (frames % 50 == 0)
        {
            this.position.push({
                x : cvs.width,
                y : this.MaxYPos * (Math.random() + 1 )
            });
        }
        for(let i = 0; i < this.position.length; i++)
        {
            let p = this.position[i];
            p.x -= this.dx; 

            let bottomPipePosition = p.y + this.h + this.gap;

            //COLLISION DETECTION
            //TOP PIPE
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h)
            {
                hit_sound.play();
                state.current = state.over;
            }
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipePosition && bird.y - bird.radius < bottomPipePosition + this.h)
            {
                hit_sound.play();
                state.current = state.over;
            }

            if (p.x + this.w <= 0)
            {
                this.position.shift();
                point_sound.play();
                Score.value += 1;
                Score.best = Math.max(Score.best,Score.value);
                localStorage.setItem('best',Score.best);

            }
        }
    },
    reset : function() {
        this.position = [];
    }
}

const Score = {
    best : parseInt(localStorage.getItem('best')) || 0,
    value: 0,

    draw : function() {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";

        if (state.current == state.game) {
            console.log("state 1")
            ctx.lineWidth = 2;
            ctx.font = "35px Kdam Thmor Pro";
            ctx.fillText(this.value,cvs.width/2,50)
            ctx.strokeText(this.value,cvs.width/2,50)
        }
        else if (state.current == state.over) {
            console.log("state 2")
            ctx.font = "25px Kdam Thmor Pro";
            ctx.fillText(this.value,240,186);
            ctx.strokeText(this.value,240,186);

            ctx.fillText(this.best,240,228);
            ctx.strokeText(this.best,240,228);
        }
    },
    reset : function() {
        console.log('Resetting the score to 0');  // Debugging statement
        value = 0;
    }

}

//Get ready message
const getReady = {
    sX: 0,
    sY:228,
    x: cvs.width/2 - 173/2,
    y: 80,
    w: 173,
    h: 152,

    
    draw: function() {
        if (state.current == state.start) {
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }



}

//Game over message
const gameOver = {
    sX: 175,
    sY:228,
    x: cvs.width/2 - 225/2,
    y: 90,
    w: 225,
    h: 202,

    draw: function() {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }

}

// UPDATE
function update(){
    bird.update();
    foreGround.update();
    pipes.update();
}

// LOOP
function loop(){
    update();
    draw();
    frames++;

    backGround.draw();
    pipes.draw();
    foreGround.draw();
    getReady.draw();
    gameOver.draw();
    Score.draw();

    bird.draw();
    requestAnimationFrame(loop);
}
loop();
