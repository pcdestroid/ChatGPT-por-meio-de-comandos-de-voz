const response = document.querySelector('.response')
const question = document.querySelector('.question')
const toAsk = document.querySelector('.toAsk')
const mic = document.querySelector('.icon-mic')
const key = document.querySelector('.key')

let conversa = [{ "role": "user", "content": "Seu nome é Edite" }, { "role": "system", "content": "Ok, meu nome é Edite" }];
toAsk.addEventListener('click', async (e) => { ouvindo() });
document.addEventListener('keydown', function (event) {
    if (event.key === 'g' || event.key === 'G') { ouvindo() }
});

if (localStorage.getItem('key') !== '') {
    key.value = localStorage.getItem('key')
}

function ret() { key.style.backgroundColor = 'transparent' }
function ouvindo() {
    if (key.value === '') {
        key.style.backgroundColor = 'rgba(255, 0, 0, 0.800)'
        alert('Crie e informe sua API KEY no campo em vermelho')
    } else {
        localStorage.setItem('key', key.value)
    }

    var synth = window.speechSynthesis;
    synth.cancel();
    var recognition = new webkitSpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.start();
    toAsk.style.backgroundColor = 'rgba(255, 0, 0, 0.800)';
    mic.style.color = 'rgba(255, 0, 0, 0.800)';
    recognition.onresult = function (event) {
        var transcription = event.results[0][0].transcript;
        let falou = transcription.charAt(0).toUpperCase() + transcription.slice(1)
        question.value = falou;
    };

    recognition.onend = async function () {
        toAsk.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        mic.style.color = 'rgba(255, 255, 255, 0.664)';

        const retorno = await getResponse(question.value)
        response.value = retorno
        falar(retorno)

    };
}

async function getResponse(text) {
    try {

        let dataAtual = new Date();
        console.log(dataAtual);

        conversa.push({ "role": "user", "content": "data:" + dataAtual + ", responda de forma concisa: " + text })
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key.value}`
            },
            body: JSON.stringify({
                "model": "gpt-3.5-turbo",
                "messages": conversa,
                "temperature": 0.7,
            })
        });
        const data = await response.json();
        conversa.push({ "role": "system", "content": data.choices[0].message.content })

        return data.choices[0].message.content;

    } catch (e) {
        console.log(e)
    }
}

function falar(pText) {
    try {
        var synth = window.speechSynthesis;
        var utterThis = new SpeechSynthesisUtterance(pText);
        // Obtém a lista de vozes disponíveis
        let voices = window.speechSynthesis.getVoices();

        // Procura pela voz do Microsoft Daniel - Portuguese (Brazil)
        let portugueseVoice = voices.find(voice => voice.name === "Microsoft Daniel - Portuguese (Brazil)");

        // Se a voz for encontrada, define ela como a voz a ser usada
        if (portugueseVoice) {
            utterThis.voice = portugueseVoice;
        }
        else {
            console.error("Voz não encontrada.");
        }
        utterThis.pitch = 0.9;
        utterThis.rate = 2.5;
        utterThis.volume = 1;
        synth.speak(utterThis);
        utterThis.onpause = function (event) { }
    } catch (err) { console.log(err) }
};