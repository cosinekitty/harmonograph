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
        const angle = 0.3 * time;

        return new Harmonograph([
            new Pendulum(220, 50, 3.0, angle * 0.0101, halflife),
            new Pendulum(30, 100, 9.01, 10.0 + angle * 0.0731, halflife),
            new Pendulum(100, 100, 6.0247, angle * 0.00134, halflife)
        ]);
    }

    function Render(time) {
        const harm = MakeHarmonograph(time);
        context.clearRect(0, 0, graph.width, graph.height);
        const dt = 0.5;
        let t = 0;
        let n = 0;
        let cx = graph.width / 2;
        let cy = graph.height / 2;
        const limit = 20;
        const scale = 1.5 * Math.min(graph.width, graph.height) / 1000;
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

    function ResizeGraph() {
        // Calculate "ideal" graph dimensions as a function of the window dimensions.
        let gwidth = window.innerWidth;
        let gheight = window.innerHeight;

        // Resize the graph canvas if needed.
        if (graph.width !== gwidth || graph.height !== gheight) {
            graph.width = gwidth;
            graph.height = gheight;
        }
    }

    ResizeGraph();
    window.addEventListener('resize', ResizeGraph);
    requestAnimationFrame(timerTick);
}
