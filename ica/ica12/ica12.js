    let newBtn = document.querySelector("#js-new-quote");
    let current = { question: "", answer: "" };
    let answerBtn = document.querySelector("#js-tweet").addEventListener("click", showAnswer);
    newBtn.addEventListener("click", getQuote);

    const answerText = document.querySelector("#js-answer-text");
const endpoint = 'https://trivia.cyberwisp.com/getrandomchristmasquestion';
async function getQuote() {
       // alert("You clicked the button!");
       try {
        const response = await fetch(endpoint);
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const json = await response.json();
      console.log(json);
      displayQuote(json['question']);
      current.question = json['question'];
      current.answer = json['answer'];
      console.log(current);

       } catch (err) {
        console.log(err)
        alert("Failed to fetch a quote. Please try again later.");
    }
    }   
    function displayQuote(quote) {
        const quoteText = document.querySelector("#js-quote-text");
        quoteText.textContent =  quote;
        answerText.textContent = "";
    }
    function showAnswer() {
        answerText.textContent = current.answer;
    }
    getQuote();
