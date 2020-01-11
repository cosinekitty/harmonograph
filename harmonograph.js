'use strict';

window.onload = function() {
    function Radians(d) {
        return d * (Math.PI / 180.0);
    }

    class Pendulum {
        constructor(xamplitude, yamplitude, frequency, phase, halflife) {
            this.xamplitude = xamplitude;
            this.yamplitude = yamplitude;
            this.limit = Math.max(Math.abs(xamplitude), Math.abs(yamplitude));
            this.frequency = Radians(frequency);
            this.phase = Radians(phase);
            this.decay = -Math.LN2 / halflife;
        }

        Calculate(t) {
            const x = this.xamplitude * Math.cos(this.frequency*t + this.phase);
            const y = this.yamplitude * Math.sin(this.frequency*t + this.phase);
            const radius = Math.exp(t * this.decay);
            return {x:x*radius, y:y*radius, r:radius*this.limit};
        }
    }

    class Harmonograph {
        constructor(pendulumList) {
            this.pendulumList = pendulumList;
        }

        Calculate(t) {
            let sum = {x:0, y:0};
            let radius = 0;
            for (let p of this.pendulumList) {
                let v = p.Calculate(t);
                sum.x += v.x;
                sum.y += v.y;
                radius = Math.max(radius, v.r);
            }
            return {x:sum.x, y:sum.y, r:radius};
        }
    }

    const graph = document.getElementById("GraphCanvas");
    const context = graph.getContext('2d');

    function MakeHarmonograph(time) {
        const halflife = 3000;

        return new Harmonograph([
            new Pendulum(220, 50, 3.0, time * 0.0101, halflife),
            new Pendulum(30, 100, 9.01, 10.0 + time * 0.0731, halflife),
            new Pendulum(100, 100, 6.0247, time * 0.00134, halflife)
        ]);
    }

    function Render(time) {
        const harm = MakeHarmonograph(time);
        context.clearRect(0, 0, graph.width, graph.height);
        const dt = 1;
        let t = 0;
        let n = 0;
        let cx = graph.width / 2;
        let cy = graph.height / 2;
        const limit = 20;
        const scale = 1.4;
        context.beginPath();
        for(;;++n) {
            const v = harm.Calculate(t);
            //console.log(v);
            if (v.r < limit) {
                break;
            }
            const x = scale*v.x + cx;
            const y = scale*v.y + cy;
            if (n === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
            t += dt;
        }
        context.strokeStyle = 'rgb(0,0,0)';
        context.stroke();
    }

    function timerTick(time) {
        Render(time);
        requestAnimationFrame(timerTick);
    }

    requestAnimationFrame(timerTick);
}

/*
    https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas

    var points = [{x:1,y:1},{x:2,y:3},{x:3,y:4},{x:4,y:2},{x:5,y:6}] //took 5 example points
    ctx.moveTo((points[0].x), points[0].y);

    for(var i = 0; i < points.length-1; i ++)
    {

    var x_mid = (points[i].x + points[i+1].x) / 2;
    var y_mid = (points[i].y + points[i+1].y) / 2;
    var cp_x1 = (x_mid + points[i].x) / 2;
    var cp_x2 = (x_mid + points[i+1].x) / 2;
    ctx.quadraticCurveTo(cp_x1,points[i].y ,x_mid, y_mid);
    ctx.quadraticCurveTo(cp_x2,points[i+1].y ,points[i+1].x,points[i+1].y);
    }
*/