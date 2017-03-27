var vi = (function() {
    var sounds = {};

    var canvas,
        ctx,
        bird;

    var blocks = [];

    var $info = $('#info');

    function setGameStartInfo() {
        $info.html('Press \'space\' or mouse click to start');
    }
    function setGameInfo() {
        $info.html('Press \'space\' or mouse click to flap');
    }

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    return {
    Block : function(x, y) {
        var self = this;

        var passed = false;

        var gap = vi.Block.gap;

        this.x = x;
        var openH = y;
        this.w = 50;
        this.h = canvas.width - openH + gap;

        var passedBy = [];

        function isOutOfSight() {
            var dif = self.x + self.w;

            return 0 > dif;
        }

        this.isInBounds = function(bird) {
            if (!(bird instanceof vi.Bird)) {
                return false;
            }

            var rect = bird.getPosition();

            if ('object' !== typeof rect) {
                return false;
            }

            if (
                !isNumeric(rect.x) ||
                !isNumeric(rect.y) ||
                !isNumeric(rect.w) ||
                !isNumeric(rect.h)
            ) {
                return false;
            }

            var topC = getTopColBounds();
            var botC = getBottomColBounds();

            var top = botC;
            var bot = topC;

            var mTarget = 5;

            if (
                (rect.y + mTarget) <= (top.y + top.h) &&
                (rect.x + rect.w) >= top.x &&
                rect.x <= top.x + top.w
            ) {
                // in top column bounds
                return true;
            } else if (
                (rect.y + rect.h - mTarget) >= bot.y &&
                (rect.x + rect.w) >= bot.x &&
                rect.x <= bot.x + bot.w
            ) {
                // in bottom column bounds
                return true;
            }

            if (-1 === passedBy.indexOf(bird) &&
                rect.x > (self.x + self.w)
            ) {
                passedBy.push(bird);
                bird.incrScore();
            }

            return false;
        };

        function getBottomColBounds() {
            return {
                x: self.x,
                y: 0,
                w: self.w,
                h: openH
            };
        }

        function getTopColBounds() {
            return {
                x: self.x,
                y: openH + gap,
                w: self.w,
                h: self.h
            };
        }

        this.draw = function(dx) {
            if (!ctx) {
                return;
            }

            dx = dx || 0;
            self.x -= dx;
            if (isOutOfSight()) {
                hide();
            }

            ctx.beginPath();

            var botCol = getBottomColBounds();
            botCol.x -= dx;
            var topCol = getTopColBounds();
            topCol.x -= dx;

            ctx.rect(
                botCol.x,
                botCol.y,
                botCol.w,
                botCol.h
            );
            ctx.rect(
                topCol.x,
                topCol.y,
                topCol.w,
                topCol.h
            );

            ctx.fillStyle = 'green';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
            ctx.stroke();
            ctx.closePath();
        };

        function hide() {
            var index = blocks.indexOf(self);
            if (0 <= index) {
                blocks.splice(index, 1);
            }
        }
    },
    Bird : function(x, y) {
    var self = this;
    var initialX = this.x = x;
    var initialY = this.y = y;
    this.w = 35;
    this.h = 35;

    var score = 0;
    var upDx = 2;
    var deg = 0;
    var drawed = 0;

    this.ty = this.y;

    var flapUpD = 5;
    var flapDownUpD = 3;
    var initialflapDownUpD = flapDownUpD;
    var flapI = 70;
    var flapC = null;

    var imgs = [];
    var cImg = 0;

    (function() {
        var img1 = new Image();
        img1.src = 'images/bird-1-frame-1.png';
        var img2 = new Image();
        img2.src = 'images/bird-1-frame-2.png';
        var img3 = new Image();
        img3.src = 'images/bird-1-frame-3.png';
        var img4 = new Image();
        img4.src = 'images/bird-1-frame-4.png';

        imgs.push(img1);
        imgs.push(img2);
        imgs.push(img3);
        imgs.push(img4);
    })();

    function getImg() {
        if (cImg >= imgs.length) {
            cImg = 0;
        }

        return imgs[cImg];
    }

    this.flap = function() {
        vi.game.playSound('flap');
        flapC += flapI;
    };

    this.resetPosition = function() {
        self.x = initialX;
        self.y = initialY;

        flapC = null;
    };

    this.clearScore = function() {
        var e = document.getElementById('score');

        score = 0;
        deg = 0;
        e.innerHTML = score;
    };

    this.incrScore = function() {
        var e = document.getElementById('score');

        if (e) {
            vi.game.playSound('score');
            score += 1;
            e.innerHTML = score;
        }
    };

    this.checkIfCrashed = function() {
        var crashed = false;

        if (self.y <= 0) {
            crashed = true;
        } else if (self.y + self.h >= canvas.height) {
            crashed = true;
        }

        for (var i in blocks) {
            if (blocks[i]) {
                if (blocks[i].isInBounds(self)) {
                    return true;
                }
            }
        }

        return crashed;
    };

    this.getPosition = function() {
        return {
            x: self.x,
            y: self.y,
            w: self.w,
            h: self.h
        };
    };

    this.draw = function() {
        if (!ctx) {
            return;
        }

        if (++drawed >= 5) {
            cImg++;
            drawed = 0;
        }

        if (null !== flapC) {
            if (flapC > 0) {
                if (0 < deg) {
                    deg = 0;
                }
                self.y -= flapUpD;
                flapC -= flapUpD;
                flapDownUpD = initialflapDownUpD;
                deg -= upDx;
            } else {
                self.y += flapDownUpD;
                flapDownUpD += .1;
                deg += 2;
            }
        }

        drawRotated(deg);

        ctx.closePath();
    };

    function drawRotated(degrees){
        ctx.save();

        ctx.translate(self.x + self.h / 2, self.y + self.w / 2);
        ctx.rotate(degrees * Math.PI / 180);

        ctx.drawImage(getImg(), -self.w / 2, -self.h / 2, self.w, self.h);
        ctx.restore();
    }
},
    Sound : function(path) {
        var sound = new Audio(path);

        this.play = function() {
            if (false === vi.game.isMute()) {
                sound.play();
            }
        };
    },
    game : (function() {
        var gameOver = true;
        var interval = null;
        var isMute = false;

        var init = false;

        var _dx = 3;

        var background = new Image();

        background.src = "images/UZKEjzG.png";
        var lod = false;
        background.onload = function() {
            lod = true;
            draw();
        };

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function createAndAddNewBlock(openH) {
            openH = openH || getRandomInt(
                10,
                canvas.height - vi.Block.gap
            );

            var b = new vi.Block(
                canvas.width,
                openH,
                ctx,
                canvas
            );
            blocks.push(b);
        }

        function draw() {
            if (!ctx) {
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (lod) {
                ctx.drawImage(background, 0, 0);
            }

            for (var i in blocks) {
                if (blocks[i])
                blocks[i].draw(_dx);
            }

            bird.draw();

            if (bird.checkIfCrashed()) {
                vi.game.playSound('hurt');
                vi.game.end();
            }

            var b = blocks[blocks.length - 1];

            if (!b || canvas.width - b.x >= 190) {
                createAndAddNewBlock();
            }
        }

        return {
            init : function(data) {
                data = data || {};
                if (false === init) {
                    sounds['flap'] = new vi.Sound('sound/sfx_wing.wav');
                    sounds['hurt'] = new vi.Sound('sound/sfx_hit.wav');
                    sounds['score'] = new vi.Sound('sound/sfx_point.wav');

                    canvas = data['canvas'];
                    ctx = data['ctx'];
                    bird = data['bird'];

                    setGameStartInfo();

                    init = true;
                }
            },
            mute : function(ele) {
                if (isMute) {
                    isMute = false;
                    ele.innerHTML = 'mute';
                } else {
                    isMute = true;
                    ele.innerHTML = 'play sound';
                }
            },
            isMute : function() {
                return isMute;
            },
            playSound : function(sound) {
                var s = sounds[sound];
                if (s && s instanceof vi.Sound) {
                    s.play();
                }
            },
            start : function() {
                if (gameOver) {
                    gameOver = false;
                    vi.game.reset();
                    vi.game.resume();
                } else {
                    vi.game.resume();
                }
                bird.clearScore();
                gameOver = false;
                vi.game.resume();
            },
            end : function() {
                gameOver = true;
                vi.game.pause(interval);
            },
            reset : function() {
                bird.resetPosition();
                blocks = [];

                draw();
            },
            pause : function() {
                setGameStartInfo();
                clearInterval(interval);
                interval = null;
            },
            resume : function() {
                if (null === interval) {
                    setGameInfo();
                    interval = setInterval(draw, 1000 / 60);
                }
            },
            isGameOver: function() {
                return gameOver;
            }
        };
    })()
};
})();
vi.Block.gap = 140;
