'use client';

import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

const SnakeGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const box = 20;
    let snake = [{ x: 10 * box, y: 10 * box }];
    let food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box,
    };
    let score = 0;
    let d: string | null = null;

    const direction = (event: KeyboardEvent) => {
      if (event.keyCode === 37 && d !== 'RIGHT') {
        d = 'LEFT';
      } else if (event.keyCode === 38 && d !== 'DOWN') {
        d = 'UP';
      } else if (event.keyCode === 39 && d !== 'LEFT') {
        d = 'RIGHT';
      } else if (event.keyCode === 40 && d !== 'UP') {
        d = 'DOWN';
      }
    };

    document.addEventListener('keydown', direction);

    const collision = (head: { x: number; y: number }, array: { x: number; y: number }[]) => {
      for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
          return true;
        }
      }
      return false;
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < snake.length; i++) {
        context.fillStyle = i === 0 ? 'green' : 'white';
        context.fillRect(snake[i].x, snake[i].y, box, box);
        context.strokeStyle = 'red';
        context.strokeRect(snake[i].x, snake[i].y, box, box);
      }

      context.fillStyle = 'red';
      context.fillRect(food.x, food.y, box, box);

      let snakeX = snake[0].x;
      let snakeY = snake[0].y;

      if (d === 'LEFT') snakeX -= box;
      if (d === 'UP') snakeY -= box;
      if (d === 'RIGHT') snakeX += box;
      if (d === 'DOWN') snakeY += box;

      if (snakeX === food.x && snakeY === food.y) {
        score++;
        food = {
          x: Math.floor(Math.random() * 20) * box,
          y: Math.floor(Math.random() * 20) * box,
        };
      } else {
        snake.pop();
      }

      let newHead = {
        x: snakeX,
        y: snakeY,
      };

      if (
        snakeX < 0 ||
        snakeX >= canvas.width ||
        snakeY < 0 ||
        snakeY >= canvas.height ||
        collision(newHead, snake)
      ) {
        clearInterval(game);
        setGameOver(true);
      }

      snake.unshift(newHead);

      context.fillStyle = 'white';
      context.font = '45px Changa one';
      context.fillText(String(score), 2 * box, 1.6 * box);
    };

    let game = setInterval(draw, 100);

    return () => {
      clearInterval(game);
      document.removeEventListener('keydown', direction);
    };
  }, []);

  return (
    <div className="game-container">
      <h1>Snake Game</h1>
      <canvas ref={canvasRef} width="400" height="400"></canvas>
      {gameOver && <h2>Game Over</h2>}
    </div>
  );
};

export default SnakeGame;