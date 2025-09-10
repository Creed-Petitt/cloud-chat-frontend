import { createContext, useState } from "react";
import axios from "axios";

// eslint-disable-next-line react-refresh/only-export-components
export const Context = createContext();

const ContextProvider = ({ children }) => {

  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");


  const delayPara = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75*index)
  }
  
  const getChatResponse = async () => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    setRecentPrompt(input);
    setPrevPrompts((prev) => [...prev, input]);
      try {
          let model="gemini";
          const response = await axios.get('http://localhost:8080/chat', {
              params: {
                  model,
                  prompt: input,
              },
          });
          let responseArray = response.data.split("**");
          let newResponse = "";
          for (let i = 0; i < responseArray.length; i++) {
            if (i % 2 === 0) {
              // Even indices: regular text
              newResponse += responseArray[i];
            }
            else {
              // Odd indices: bold text
              newResponse += "<b>"+responseArray[i] +"</b>";
            }
          }
          let typedResponse = newResponse.split("*").join("<br/>")
          let typedResponseArray = typedResponse.split(" ");
          for (let i = 0; i < typedResponseArray.length; i++) {
            const nextWord = typedResponseArray[i];
            delayPara(i, nextWord + " ");
          }

      } catch (error) {
          console.error('Error fetching chat response:', error);
          throw new Error('Failed to get response from the server.');
      }
      setLoading(false);
      setInput("");
  };

  const contextValue = {
      getChatResponse, input, setInput, recentPrompt, setRecentPrompt,
      prevPrompts, setPrevPrompts, showResult, setShowResult,
      loading, setLoading, resultData, setResultData
  }

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  )

}

export default ContextProvider;