import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {updateValidUserInput} from "../actions";
import {VALID_ENGLISH_WORD_LIST} from "../setting";

import {Alert} from 'react-bootstrap';
import './Input.css';

export default function Input(props) {

    const validWordLength = props.validWordLength;
    // let userInput;
    /**
     * Why userInput should be a local state:
     *
     * Use "let userInput" instead of useState hook to keep track of
     * userInput value between re-renders, will cause error when the
     * user enters a word, and clicks "submit" once,
     * then click again without modifying the input.
     *
     *  This error happens because every time user clicks "submit",
     *  function validateInput() is called, then the checkLength method
     *  calls setValidationMessage which triggers Input component to be re-rendered.
     *  That means all code inside Input component will be re-run, and
     *  so the "let userInput" will reset userInput back to "undefined".
     *  And since user didn't modify input before user clicks "submit" again,
     *  the onchange method is not called, i.e. userInput is not given any value from the UI,
     *  so when user clicks "submit", userInput is still "undefined".
     *  Thus, calling validateInput will result in an Error.
     */

    const [userInput, setUserInput] = useState("");
    console.log("Input Re-rendered!, userInput:", userInput);
    const [validationMessage, setValidationMessage] = useState("");

    const isInputDisabled = useSelector(state => state.game.isInputDisabled);
    const dispatch = useDispatch();


    function validateInput(userInput, wordLength) {
        if (checkLength(userInput, wordLength)) {
            return checkEnglishWord(userInput)
        }
        return false;
    }

    /**
     * Check input length and Update validation Message
     */
    function checkLength(userInput, wordLength) {
        if (userInput.length < wordLength) {
            setValidationMessage("Your input word is too short!");
            return false;
        } else if (userInput.length > wordLength) {
            setValidationMessage("Your input word is too long!");
            return false;
        }
        // setValidationMessage("");  //Don't need this. As long as we reset message to "" in checkEnglishWord.
        return true;
    }

    function checkEnglishWord(userInput) {
        if (!(VALID_ENGLISH_WORD_LIST.includes(userInput))) {
            setValidationMessage("Your input word is not a valid English word! ");
            return false;
        }
        setValidationMessage("");
        // Reset message to be empty when entering a
        // valid input after an invalid input
        return true;
    }


    return (
        <div>
            <Alert className="alert" variant="info" style={{
                padding: "0.5rem 0.5rem",
                display: isInputDisabled ? 'none' : 'block'
            }}>
                <p style={{marginBottom: "0"}}>Please enter a {validWordLength}-letter word:</p>
            </Alert>
            <div className="input-submit-container">
              <input id="input-field"
                  onChange={(event) => {
                      setUserInput(event.target.value);
                      //userInput = event.target.value;
                      console.log("userInput at onChange: ", userInput)
                  }}
                  type={"text"}
                  disabled={isInputDisabled}
              />
              {/* disabled={isInputDisabled} */}

              <button className="click-button" onClick={() => {
                  console.log("userInput: ", userInput);
                  if (validateInput(userInput, validWordLength)) {
                      const answerInfo = props.answerInfo;
                      console.log("When confirm is a valid Input, answerInfo:", answerInfo);

                      /*
                      NOTICE! 1. We need a deep copy of answerInfo,
                      because in checkUserGuess() function,
                      we will modify the count once a target character appears in the user's guess.
                      */

                      /*
                      NOTICE! 2.  {...answerInfo} is not a DEEP COPY!!
                      Because answerInfo is a deeply nested object.
                      Each value in answerInfo is still a object, which still contains complex type like Set.
                      */
                      const answerInfoCopy = {};
                      for (let char in answerInfo) { //char is the key
                          answerInfoCopy[char] = {
                              index: answerInfo[char].index,
                              count: answerInfo[char].count
                          }
                      }

                      dispatch(updateValidUserInput(userInput, answerInfoCopy, validWordLength, props.totalAttemptNumber));
                  }
              }} disabled={isInputDisabled}
              >{"Submit"}</button>
            </div>
            {validationMessage === "" ? <></> :
                <Alert className="alert" variant="danger" style={{padding: "0.5rem 0.5rem"}}>
                    <p style={{marginBottom: "0"}}>{validationMessage}</p>
                </Alert>
            }

        </div>
    )
}