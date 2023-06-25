import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/rectangles-no-7.ogg";
import midi from "../audio/rectangles-no-7.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null; 

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[5].notes; // Thor 5
                    const noteSet2 = result.tracks[9].notes; // Thor 1
                    const noteSet3 = result.tracks[6].notes; // Thor 6
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.scheduleCueSet(noteSet3, 'executeCueSet3');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    // document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.aspectRatio = 0;
        p.cellSize = 0;
        p.cells = [];
        p.cellW = 0;
        p.cellH = 0;
        p.nbCellW = 0;
        p.nbCellH = 0;

        p.prevX = 0;
        p.prevY = 0;
        p.currentX = 0;
        p.currentY = 0;
        p.prevX2 = 0;
        p.prevY2 = 0;
        p.currentX2 = 0;
        p.currentY2 = 0;
        p.globalOpacity = 1;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0);

            p.rectMode(p.CENTER);
            p.colorMode(p.HSB, 1);

            // this would be a better way to determine cell size:
            // https://math.stackexchange.com/questions/921539/maximum-square-cells-in-a-rectangle
            p.cellW = p.width / 96;
            p.cellH = p.height / 54;
            
            p.nbCellW = Math.floor(p.width / p.cellW);
            p.nbCellH = Math.floor(p.height / p.cellH);
            
            for (var i = 0; i < p.nbCellW * p.nbCellH; i ++) {
                p.cells.push(p.createVector(0, 0));
            }

            p.currentX = p.width / 2;
            p.currentY = p.height / 2;
            p.currentX2 = p.width / 2;
            p.currentY2 = p.height / 2;
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
            }
        }

        p.drawCellSet1 = () => {
            var deltaMouse = p.createVector(p.currentX - p.prevX, p.currentY - p.prevY);
            
            for (var i = 0; i < p.nbCellW; i ++) {
                for (var j = 0; j < p.nbCellH; j ++) {
                    var k = i + j * p.nbCellW;
                    var x =  p.cellW * i + p.cellW/2;
                    var y =  p.cellH * j + p.cellH/2;
                    var d = Math.max(1, p.dist(p.currentX, p.currentY, x, y));
                    
                    deltaMouse.normalize();
                    deltaMouse.mult(1/(d*30));
                    p.cells[k].add(deltaMouse);
                    p.cells[k].limit(10);
                    
                    var h = p.map(p.cells[k].heading(), -p.PI, p.PI, 0, 1);
                    var b = p.min(p.cells[k].mag()*100, 10);
                    p.fill(h, 1, b, p.globalOpacity);
                    
                    p.rect(x, y, p.cellW, p.cellH);
                    
                    p.cells[k].mult(.98);
                }
            }
        }

        p.drawCellSet2 = () => {
            var deltaMouse = p.createVector(p.currentX2 - p.prevX2, p.currentY2 - p.prevY2);
            
            for (var i = 0; i < p.nbCellW; i ++) {
                for (var j = 0; j < p.nbCellH; j ++) {
                    var k = i + j * p.nbCellW;
                    var x =  p.cellW * i + p.cellW/2;
                    var y =  p.cellH * j + p.cellH/2;
                    var d = Math.max(1, p.dist(p.currentX2, p.currentY2, x, y));
                    
                    deltaMouse.normalize();
                    deltaMouse.mult(1/(d*30));
                    p.cells[k].add(deltaMouse);
                    p.cells[k].limit(10);
                    
                    var h = p.map(p.cells[k].heading(), -p.PI, p.PI, 0, 1);
                    var s = p.min(p.cells[k].mag()*100, 10);
                    p.fill(h, s, 1, p.globalOpacity);
                    
                    p.rect(x, y, p.cellW, p.cellH);
                    
                    p.cells[k].mult(.98);
                }
            }
        }


        p.executeCueSet1 = (note) => {
            const { currentCue } = note;
            p.globalOpacity = currentCue % 2 === 0 ? 0.6 : 0.3;
            const cellSizes = [
                {
                    x: p.width / 48,
                    y: p.height / 27,
                },
                {
                    x: p.width / 32,
                    y: p.height / 18,
                },
                {
                    x: p.width / 16,
                    y: p.height / 9,
                },
                {
                    x: p.width / 12,
                    y: p.height / 6,
                }
            ];
            
            if(currentCue <= 24) {
                p.cells = [];
                p.cellW = currentCue % 2 === 0 ? p.width / 96 : cellSizes[((currentCue % 8 - 1) / 2)].x;
                p.cellH = currentCue % 2 === 0 ? p.height / 54 : cellSizes[((currentCue % 8 - 1) / 2)].y;
                p.nbCellW = Math.floor(p.width / p.cellW);
                p.nbCellH = Math.floor(p.height / p.cellH);
                
                for (var i = 0; i < p.nbCellW * p.nbCellH; i ++) {
                    p.cells.push(p.createVector(0, 0));
                }
            }
        }

        p.executeCueSet2 = (note) => {
            const { currentCue, midi } = note;
            const delay = 5;

            p.prevX = p.currentX;
            p.prevY = p.currentY;
            p.currentX = midi > 70 ? p.random(p.width / 2 , p.width) : p.random(0, p.width / 2);
            p.currentY = p.random(0, p.height);

            for (let i = 0; i < 5; i++) {
                setTimeout(
                    function () {
                        p.drawCellSet1();
                    },
                    (delay * i)
                );
            }
        }

        p.executeCueSet3 = (note) => {
            const { currentCue } = note;
            const myModulo = currentCue % 3;
            const delay = 2;
            p.globalOpacity = 0.5;

            p.prevX2 = p.currentX2;
            p.prevY2 = p.currentY2;
            p.currentX2 = p.width / 2;
            p.currentY2 = p.height / 4 * (myModulo + 1);

            for (let i = 0; i < 5; i++) {
                setTimeout(
                    function () {
                        p.drawCellSet2();
                    },
                    (delay * i)
                );
                
            }
        }
        
        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    //document.getElementById("play-icon").classList.add("fade-out");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/",
                    "\n",
                    "Coding Inspiration: https://openprocessing.org/sketch/849430"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
        </div>
    );
};

export default P5SketchWithAudio;
