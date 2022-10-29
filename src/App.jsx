import {nanoid} from 'nanoid';
import {useEffect, useState} from 'react';
import Confetti from 'react-confetti';
import './App.css';
import Die from './components/Die';

function App() {
  const [dice, setDice] = useState(allNewDice());
  const [tenzies, setTenzies] = useState(false);
  const [rolls, setRolls] = useState(0)
  const [time, setTime] = useState(0)
  const [pause, setPause] = useState(false)
  const [bests, setBests] = useState(
    JSON.parse(localStorage.getItem('bests')) || []
  );

  useEffect(() => {
    const allHeld = dice.every(die => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every(die => die.value === firstValue);

    localStorage.setItem('bests', JSON.stringify(bests.sort((a, b) => a.value - b.value)));

    if(pause) {
      setTime(oldTime => oldTime)
    }else {
      if(!tenzies) {
        setTimeout(() => {
          setTime(time + 1)
        }, 1000)
      }
    }

    if (allHeld && allSameValue) {
      setTenzies(true);
      console.log('You won!');
    }
  }, [dice, time, pause, tenzies, bests]);

  function createNewBest() {
    const newBest = {
      id: nanoid(),
      value: time,
    };
    if(bests.length < 5){
      setBests(prevBests => [newBest, ...prevBests]);
    }else {
      if(time < bests[4].value){
        console.log('nuevo minimo time')
        setBests(prevBests => {
          prevBests.pop()
          return [newBest, ...prevBests]
        })
      }
    }
  }

  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid(),
    };
  }

  function allNewDice() {
    const newDice = [];
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }

  function rollDice() {
    if (!tenzies) {
      setRolls(rolls + 1)
      setDice(oldDice =>
        oldDice.map(die => {
          return die.isHeld ? die : generateNewDie();
        }),
      );
    } else {
      createNewBest()
      setRolls(0)
      setTime(0)
      setPause(false)
      setTenzies(false);
      setDice(allNewDice());
    }
  }

  function holdDice(id) {
    if(pause){
      return
    }else{
      setDice(oldDice =>
        oldDice.map(die => {
          return die.id === id ? {...die, isHeld: !die.isHeld} : die;
        }),
      );
    }
  }
    
  function handlePause() {
    setPause(!pause)
  }

  const diceElements = dice.map(die => (
    <Die
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      holdDice={() => {
        holdDice(die.id);
      }}
    />
  ));

  return (
    <main className='main-container'>

      <div className="game-container">
        {tenzies && <Confetti />}
        <h1 className='title'>Tenzies</h1>
        <p className='instructions'>
          Roll until all dice are the same. Click each die to freeze it at its
          current value between rolls.
        </p>
        <div className='grid-tenzies'>
          {diceElements}
        </div>
        <div className='rolls-info'>
          <h4 className='rolls'>Rolls: {rolls}</h4>
          <h4 className='time'>Time: {time}s</h4>
        </div>
        <div className="actions">
          <button disabled={pause} onClick={rollDice} className='roll-button'>
            {tenzies ? 'New Game' : 'Roll'}
          </button>
          {
            !tenzies && <button className={ pause ? 'icon-btn play-button' : 'icon-btn pause-button'} onClick={handlePause}>
              {
                !pause ? <span className="material-symbols-rounded">pause</span>
                : <span className="material-symbols-rounded">play_arrow</span>  
              }
            </button>
          }
        </div>
      </div>
      <div className="best-times">
          <h2 className='title-bests'>Best times </h2>
          <ol>
            {
              bests.map(best=>
                <li key={best.id} className="best-item">
                  {best.value}s
                </li>
              )
            }
          </ol>
      </div>      
    </main>
  );
}

export default App;
