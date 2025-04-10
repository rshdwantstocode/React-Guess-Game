import { useState, useEffect } from 'react'
import { languages } from '../languages'
import { getFarewellText, getRandomWord } from '../utils';
import clsx from 'clsx';
import ReactConfetti from 'react-confetti';
import loseSoundEffect from './assets/lose_sound_effect.m4a';
import winSoundEffect from './assets/win_sound_effect.m4a'

import './App.css'

function App() {
  // State values
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());
  const [guessedLetter, setGuessedLetter] = useState([]);
  const [remainingGuess, setRemainingGuess] = useState(languages.length - 1)
  //derived values
  const wrongGuessCount = guessedLetter.filter(letter => (
    !currentWord.includes(letter))).length

  const numGuessesLeft = languages.length - 1
  const isGameWon = currentWord.split("").every(letter => (
    guessedLetter.includes(letter)
  ))
  const isGameLost = wrongGuessCount >= numGuessesLeft
  const isGameOver = isGameWon || isGameLost

  const lastGuessedLetter = guessedLetter[guessedLetter.length - 1];
  const isLastGuessedWrong = lastGuessedLetter && !currentWord.includes(lastGuessedLetter);


  const word = currentWord.split("").map((letter, index) => {
    const isGuessed = isGameLost || guessedLetter.includes(letter);

    const missedLetterClass = clsx("letter",
      isGameLost && !guessedLetter.includes(letter) && "missed-letter"
    )

    return (
      <span className={missedLetterClass} key={index}>{isGuessed ? letter.toUpperCase() : null}</span>
    )
  })


  const alphabet = "abcdefghijklmnopqrstuvwxyz";


  const letters = alphabet.split("").map((letter, index) => {
    const isGuessed = guessedLetter.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);

    const buttonClass = clsx({ correct: isCorrect, wrong: isWrong })

    return (
      <button
        className={buttonClass}
        key={index}
        disabled={isGameOver}
        aria-disabled={guessedLetter.includes(letter)}
        aria-label={`Letter ${letter}`}
        onClick={() => GuessedLetters(letter)}>
        {letter.toUpperCase()}
      </button>)
  })


  function GuessedLetters(letter) {
    setGuessedLetter(prevLetter =>
      prevLetter.includes(letter) ? prevLetter : [...prevLetter, letter]
    )

    if (!currentWord.includes(letter)) {
      setRemainingGuess(prevGuessCount => prevGuessCount - 1)
    }
  }

  function NewGame() {
    setGuessedLetter([])
    setCurrentWord(getRandomWord())
    setRemainingGuess(languages.length - 1)
  }

  const languagesList = languages.map((element, index) => {
    const isLanguageLost = index < wrongGuessCount

    const styleClass = clsx("chip", isLanguageLost && "lost")
    return (
      <span className={styleClass} style={{ backgroundColor: element.backgroundColor, color: element.color }}
        key={element.name}>
        {element.name}</span>
    )
  })

  useEffect(() => {
    let audio;
    if (isGameLost) {
      audio = new Audio(loseSoundEffect)
      audio.play().catch(err => {
        console.log(err);
      })
    } else if (isGameWon) {
      audio = new Audio(winSoundEffect)
      audio.play().catch(err => {
        console.log(err);
      })
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, [isGameLost, isGameWon])


  function RenderGameStatus() {
    if (!isGameOver && isLastGuessedWrong) {
      return (<p className='farewell-text'>{getFarewellText(languages[wrongGuessCount - 1].name)}</p>)
    }


    if (isGameWon) {
      return (<>
        <h2>You Win!</h2> <h3>Well done!🎉</h3></>)
    }
    if (isGameLost) {
      return (<>
        <audio autoPlay>
          <source src={loseSoundEffect} type="audio/m4a" />
        </audio>
        <h2>Game Over!</h2><h3>You lose! better start learning Assembly 😭</h3>
      </>)
    }
  }

  const StyleClass = clsx('game-status',
    {
      lost: isGameLost,
      won: isGameWon,
      wrongGuess: !isGameOver && isLastGuessedWrong
    }
  )

  return (
    <>
      <main>
        {isGameWon && <ReactConfetti recycle={false} numberOfPieces={2000} />}
        <header>
          <h1>Assembly: Endgame</h1>
          <p>Guess the word in under 8 attempts to keep the programming world safe from Assembly!</p>
        </header>
        <div
          className={StyleClass}
          aria-live='polite'
          role='statuss'
        >
          {RenderGameStatus()}
        </div>

        <div className='languages-list'>
          {languagesList}
          {"Guesses Left: " + remainingGuess}
        </div>

        <div className='letter-container'>
          {word}
        </div>

        <div className='key-container'>
          {letters}
        </div>

        <div className='sr-only' aria-live='polite' role='status'>

          <p>
            {currentWord.includes(lastGuessedLetter) ?
              `Correct! The letter ${lastGuessedLetter} is in the word.` :
              `Sorry, the letter ${lastGuessedLetter} is not in the word.`
            }
            You have {numGuessesLeft} attempts left.
          </p>

          <p>{currentWord.split(" ").map(letter => (
            guessedLetter.includes(letter) ? letter + "." : "blank."
          )).join(" ")}</p>
        </div>

        {isGameOver && <button className='new-game' onClick={() => NewGame()}>New Game</button>}
      </main>
    </>
  )
}

export default App
